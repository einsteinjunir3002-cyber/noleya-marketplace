import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run, get, query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const product = get('SELECT * FROM products WHERE id = ?', [id]);
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const images = query('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC', [id]);
  return NextResponse.json({ product, images });
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN' && user.role !== 'SELLER')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const {
      name,
      description,
      priceGhs,
      comparePriceGhs,
      categoryId,
      stockQuantity,
      status,
      deliveryInfo,
      specifications,
      isFeatured,
    } = body;

    // Check ownership if role is seller
    if (user.role === 'SELLER') {
      const existing = get<{ seller_id: number }>('SELECT seller_id FROM products WHERE id = ?', [id]);
      const sellerRow = get<{ id: number }>('SELECT id FROM sellers WHERE user_id = ?', [user.id]);
      if (!existing || !sellerRow || existing.seller_id !== sellerRow.id) {
        return NextResponse.json({ error: 'You do not have permission to modify this product.' }, { status: 403 });
      }
    }

    run(
      `UPDATE products 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           price_ghs = COALESCE(?, price_ghs),
           compare_price_ghs = ?,
           category_id = COALESCE(?, category_id),
           stock_quantity = COALESCE(?, stock_quantity),
           status = COALESCE(?, status),
           delivery_info = COALESCE(?, delivery_info),
           specifications = COALESCE(?, specifications),
           is_featured = COALESCE(?, is_featured),
           updated_at = datetime('now')
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        description ? description.trim() : null,
        priceGhs !== undefined ? Number(priceGhs) : null,
        comparePriceGhs !== undefined ? (comparePriceGhs ? Number(comparePriceGhs) : null) : null,
        categoryId !== undefined ? Number(categoryId) : null,
        stockQuantity !== undefined ? Number(stockQuantity) : null,
        status || null,
        deliveryInfo || null,
        specifications || null,
        isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
        id,
      ]
    );

    logAuditAction(user.id, user.email, 'UPDATE_PRODUCT', 'products', Number(id));

    return NextResponse.json({ success: true, message: 'Product updated successfully.' });
  } catch (err: any) {
    console.error('Update product error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update product.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    run('DELETE FROM product_images WHERE product_id = ?', [id]);
    run('DELETE FROM products WHERE id = ?', [id]);

    logAuditAction(user.id, user.email, 'DELETE_PRODUCT', 'products', Number(id));

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err: any) {
    console.error('Delete product error:', err);
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}
