import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';
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
    const { status } = body;

    const allowed = ['draft', 'pending_approval', 'published', 'unavailable', 'archived', 'rejected'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid product status.' }, { status: 400 });
    }

    run('UPDATE products SET status = ?, updated_at = datetime("now") WHERE id = ?', [status, id]);
    logAuditAction(user.id, user.email, 'UPDATE_PRODUCT_STATUS', 'products', Number(id), { status });

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update status.' }, { status: 500 });
  }
}
