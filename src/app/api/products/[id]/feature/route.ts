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
    const isFeatured = body.isFeatured ? 1 : 0;

    run('UPDATE products SET is_featured = ?, updated_at = datetime("now") WHERE id = ?', [isFeatured, id]);
    logAuditAction(user.id, user.email, 'TOGGLE_FEATURE_PRODUCT', 'products', Number(id), { isFeatured });

    return NextResponse.json({ success: true, isFeatured });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update feature status.' }, { status: 500 });
  }
}
