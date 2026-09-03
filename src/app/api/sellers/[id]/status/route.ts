import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { run, get } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status, isApplication } = body;

    const allowed = ['approved', 'suspended', 'rejected', 'pending'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    if (isApplication) {
      // It's a seller application approval/rejection
      const app = get<{
        id: number;
        full_name: string;
        business_name: string;
        whatsapp_number: string;
        email: string;
        region: string;
      }>('SELECT * FROM seller_applications WHERE id = ?', [id]);

      if (!app) {
        return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
      }

      run('UPDATE seller_applications SET status = ?, updated_at = datetime("now") WHERE id = ?', [status, id]);

      if (status === 'approved') {
        // Check if user already exists
        let existingUser = get<{ id: number }>('SELECT id FROM users WHERE LOWER(email) = ?', [app.email.toLowerCase()]);
        let userId = existingUser?.id;

        if (!userId) {
          const tempPassword = 'Seller' + Math.floor(100000 + Math.random() * 900000);
          const { hash, salt } = hashPassword(tempPassword);
          const userRes = run(
            `INSERT INTO users (email, password_hash, salt, name, phone, role, status, must_change_password, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 'SELLER', 'active', 1, datetime('now'), datetime('now'))`,
            [app.email.toLowerCase(), hash, salt, app.full_name, app.whatsapp_number]
          );
          userId = Number(userRes.lastInsertRowid);
        }

        const slugBase = app.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const slug = `${slugBase}-${id}`;

        run(
          `INSERT OR IGNORE INTO sellers (user_id, business_name, slug, whatsapp_number, email, region, commission_rate, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 5.0, 'approved', datetime('now'), datetime('now'))`,
          [userId, app.business_name, slug, app.whatsapp_number, app.email, app.region]
        );
      }

      logAuditAction(user.id, user.email, `SELLER_APP_${status.toUpperCase()}`, 'seller_applications', Number(id));
      return NextResponse.json({ success: true, message: `Application marked as ${status}.` });
    } else {
      // Updating existing seller status
      run('UPDATE sellers SET status = ?, updated_at = datetime("now") WHERE id = ?', [status, id]);
      logAuditAction(user.id, user.email, `SELLER_${status.toUpperCase()}`, 'sellers', Number(id));
      return NextResponse.json({ success: true, message: `Seller marked as ${status}.` });
    }
  } catch (err: any) {
    console.error('Update seller status error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update seller status.' }, { status: 500 });
  }
}
