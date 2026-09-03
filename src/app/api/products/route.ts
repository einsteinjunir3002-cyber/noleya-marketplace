import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run, query, get } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');

  let sql = `
    SELECT p.*, c.name as category_name, s.business_name as seller_name,
      (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.display_order ASC LIMIT 1) as primary_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN sellers s ON p.seller_id = s.id
  `;

  const params: any[] = [];
  if (sellerId) {
    sql += ' WHERE p.seller_id = ?';
    params.push(sellerId);
  }

  sql += ' ORDER BY p.id DESC';
  const products = query(sql, params);
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN' && user.role !== 'SELLER')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      priceGhs,
      comparePriceGhs,
      categoryId,
      sellerId: requestedSellerId,
      stockQuantity,
      sku,
      specifications,
      deliveryInfo,
      images, // array of { url, thumbnailUrl, altText }
    } = body;

    if (!name || !description || priceGhs === undefined || !categoryId) {
      return NextResponse.json({ error: 'Name, description, price, and category are required.' }, { status: 400 });
    }

    // Determine sellerId
    let sellerId = requestedSellerId;
    if (user.role === 'SELLER') {
      const sellerRow = get<{ id: number }>('SELECT id FROM sellers WHERE user_id = ?', [user.id]);
      if (!sellerRow) {
        return NextResponse.json({ error: 'Seller profile not found.' }, { status: 404 });
      }
      sellerId = sellerRow.id;
    } else if (!sellerId) {
      // Default to first seller if admin didn't specify
      const firstSeller = get<{ id: number }>('SELECT id FROM sellers LIMIT 1');
      sellerId = firstSeller?.id || 1;
    }

    // Slug generation
    const slugBase = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${slugBase}-${randomSuffix}`;

    // Status: If seller creates it, status is 'pending_approval' or 'published' based on policy.
    // Admin/Owner immediately publishes.
    const status = user.role === 'OWNER' || user.role === 'ADMIN' ? 'published' : 'published';

    const insertResult = run(
      `INSERT INTO products 
        (seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, status, is_featured, sku, specifications, delivery_info, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        sellerId,
        categoryId,
        name.trim(),
        slug,
        description.trim(),
        Number(priceGhs),
        comparePriceGhs ? Number(comparePriceGhs) : null,
        stockQuantity !== undefined ? Number(stockQuantity) : 10,
        status,
        sku || null,
        specifications ? (typeof specifications === 'string' ? specifications : JSON.stringify(specifications)) : null,
        deliveryInfo || 'Delivery within 24-48 hours across Ghana.',
      ]
    );

    const productId = Number(insertResult.lastInsertRowid);

    // Insert images
    if (images && Array.isArray(images) && images.length > 0) {
      images.forEach((img: any, idx: number) => {
        run(
          `INSERT INTO product_images (product_id, image_url, thumbnail_url, alt_text, display_order, is_primary, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
          [
            productId,
            img.url,
            img.thumbnailUrl || img.url,
            img.altText || name,
            idx,
            idx === 0 ? 1 : 0,
          ]
        );
      });
    }

    logAuditAction(user.id, user.email, 'CREATE_PRODUCT', 'products', productId, { name, priceGhs });

    return NextResponse.json({
      success: true,
      productId,
      slug,
      message: 'Product created successfully.',
    });
  } catch (err: any) {
    console.error('Product creation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create product.' }, { status: 500 });
  }
}
