import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run, query, get } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  const categories = query(`
    SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
    FROM categories c
    ORDER BY c.display_order ASC, c.name ASC
  `);
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, displayOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const res = run(
      `INSERT INTO categories (name, slug, description, icon, display_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      [name.trim(), slug, description || null, icon || 'ShoppingBag', displayOrder || 0]
    );

    const categoryId = Number(res.lastInsertRowid);
    logAuditAction(user.id, user.email, 'CREATE_CATEGORY', 'categories', categoryId, { name, slug });

    return NextResponse.json({ success: true, categoryId });
  } catch (err: any) {
    console.error('Create category error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create category.' }, { status: 500 });
  }
}
