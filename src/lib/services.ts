import { query, get, run } from './db';
import { Product, Category, Region, FoundationImpact, SiteSettings, ProductImage, Seller } from './types';

export { formatGHS, formatGhanaPhone, sanitizeWhatsAppPhone, buildWhatsAppUrl } from './utils';

export function getSiteSettings(): SiteSettings {
  const rows = query<{ key: string; value: string }>('SELECT key, value FROM site_settings');
  const settings: SiteSettings = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return settings;
}

export function getCategories(includeInactive: boolean = false): Category[] {
  const sql = `
    SELECT c.*, 
      (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'published') as product_count
    FROM categories c
    ${includeInactive ? '' : 'WHERE c.is_active = 1'}
    ORDER BY c.display_order ASC, c.name ASC
  `;
  return query<Category>(sql);
}

export function getRegions(): Region[] {
  return query<Region>('SELECT * FROM regions WHERE is_active = 1 ORDER BY name ASC');
}

export function getFeaturedProducts(limit: number = 8): Product[] {
  const sql = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      s.business_name as seller_name,
      s.slug as seller_slug,
      s.whatsapp_number as seller_whatsapp,
      s.region as seller_region,
      s.city as seller_city,
      (
        SELECT image_url FROM product_images pi 
        WHERE pi.product_id = p.id 
        ORDER BY pi.is_primary DESC, pi.display_order ASC 
        LIMIT 1
      ) as primary_image,
      (
        SELECT thumbnail_url FROM product_images pi 
        WHERE pi.product_id = p.id 
        ORDER BY pi.is_primary DESC, pi.display_order ASC 
        LIMIT 1
      ) as thumbnail_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN sellers s ON p.seller_id = s.id
    WHERE p.status = 'published' AND s.status = 'approved' AND p.is_featured = 1
    ORDER BY p.id DESC
    LIMIT ?
  `;
  return query<Product>(sql, [limit]);
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerSlug?: string;
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
  limit?: number;
  offset?: number;
}

export function getProducts(params: ProductFilterParams = {}): { products: Product[]; total: number } {
  let whereClauses = ["p.status = 'published'", "s.status = 'approved'"];
  const sqlParams: any[] = [];

  if (params.search && params.search.trim()) {
    const term = `%${params.search.trim()}%`;
    whereClauses.push('(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR s.business_name LIKE ?)');
    sqlParams.push(term, term, term, term);
  }

  if (params.category && params.category.trim()) {
    whereClauses.push('c.slug = ?');
    sqlParams.push(params.category.trim());
  }

  if (params.region && params.region.trim()) {
    whereClauses.push('s.region = ?');
    sqlParams.push(params.region.trim());
  }

  if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
    whereClauses.push('p.price_ghs >= ?');
    sqlParams.push(params.minPrice);
  }

  if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
    whereClauses.push('p.price_ghs <= ?');
    sqlParams.push(params.maxPrice);
  }

  if (params.sellerSlug && params.sellerSlug.trim()) {
    whereClauses.push('s.slug = ?');
    sqlParams.push(params.sellerSlug.trim());
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Get total count
  const countSql = `
    SELECT COUNT(*) as total
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN sellers s ON p.seller_id = s.id
    ${whereStr}
  `;
  const countRow = get<{ total: number }>(countSql, sqlParams);
  const total = countRow?.total || 0;

  // Ordering
  let orderClause = 'ORDER BY p.is_featured DESC, p.id DESC';
  switch (params.sort) {
    case 'newest':
      orderClause = 'ORDER BY p.created_at DESC';
      break;
    case 'price_asc':
      orderClause = 'ORDER BY p.price_ghs ASC';
      break;
    case 'price_desc':
      orderClause = 'ORDER BY p.price_ghs DESC';
      break;
    case 'name_asc':
      orderClause = 'ORDER BY p.name ASC';
      break;
    case 'featured':
    default:
      orderClause = 'ORDER BY p.is_featured DESC, p.id DESC';
      break;
  }

  const limit = params.limit || 24;
  const offset = params.offset || 0;

  const dataSql = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      s.business_name as seller_name,
      s.slug as seller_slug,
      s.whatsapp_number as seller_whatsapp,
      s.region as seller_region,
      s.city as seller_city,
      (
        SELECT image_url FROM product_images pi 
        WHERE pi.product_id = p.id 
        ORDER BY pi.is_primary DESC, pi.display_order ASC 
        LIMIT 1
      ) as primary_image,
      (
        SELECT thumbnail_url FROM product_images pi 
        WHERE pi.product_id = p.id 
        ORDER BY pi.is_primary DESC, pi.display_order ASC 
        LIMIT 1
      ) as thumbnail_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN sellers s ON p.seller_id = s.id
    ${whereStr}
    ${orderClause}
    LIMIT ? OFFSET ?
  `;

  const products = query<Product>(dataSql, [...sqlParams, limit, offset]);
  return { products, total };
}

export function getProductBySlug(slug: string): Product | null {
  const sql = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      s.business_name as seller_name,
      s.slug as seller_slug,
      s.whatsapp_number as seller_whatsapp,
      s.phone as seller_phone,
      s.region as seller_region,
      s.city as seller_city,
      s.bio as seller_bio,
      s.delivery_notes as seller_delivery_notes
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN sellers s ON p.seller_id = s.id
    WHERE p.slug = ?
  `;
  const product = get<Product>(sql, [slug]);
  if (!product) return null;

  // Fetch all images for product
  const images = query<ProductImage>(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC',
    [product.id]
  );
  product.images = images;
  product.primary_image = images[0]?.image_url || '/placeholder.png';
  product.thumbnail_image = images[0]?.thumbnail_url || product.primary_image;

  // Increment views count asynchronously
  try {
    run('UPDATE products SET views_count = views_count + 1 WHERE id = ?', [product.id]);
  } catch (err) {
    // Non-blocking
  }

  return product;
}

export function getRelatedProducts(categoryId: number, excludeProductId: number, limit: number = 4): Product[] {
  const sql = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      s.business_name as seller_name,
      s.slug as seller_slug,
      s.whatsapp_number as seller_whatsapp,
      s.region as seller_region,
      (
        SELECT image_url FROM product_images pi 
        WHERE pi.product_id = p.id 
        ORDER BY pi.is_primary DESC, pi.display_order ASC 
        LIMIT 1
      ) as primary_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN sellers s ON p.seller_id = s.id
    WHERE p.status = 'published' AND s.status = 'approved' AND p.category_id = ? AND p.id != ?
    ORDER BY RANDOM()
    LIMIT ?
  `;
  return query<Product>(sql, [categoryId, excludeProductId, limit]);
}

export function getImpactInitiatives(): FoundationImpact[] {
  return query<FoundationImpact>(
    "SELECT * FROM foundation_impact WHERE status = 'active' ORDER BY display_order ASC"
  );
}
