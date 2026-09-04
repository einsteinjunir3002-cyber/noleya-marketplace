const { Pool } = require('pg');
const { DatabaseSync } = require('node:sqlite');

async function sync() {
  console.log('--- Syncing Noléya Marketplace Database to Supabase PostgreSQL ---');
  
  const pool = new Pool({
    connectionString: 'postgresql://postgres.vwzyhognnrmpcecrhbsg:Esq.Likem12345%21@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  const sqlite = new DatabaseSync('./data/noleya.db');

  // 1. Sync sellers
  const sellers = sqlite.prepare('SELECT * FROM sellers').all();
  for (const s of sellers) {
    await pool.query(`
      INSERT INTO noleya_sellers (id, user_id, business_name, slug, whatsapp_number, phone, email, region, city, address, bio, commission_rate, status, delivery_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        slug = EXCLUDED.slug,
        whatsapp_number = EXCLUDED.whatsapp_number,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        region = EXCLUDED.region,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        bio = EXCLUDED.bio,
        delivery_notes = EXCLUDED.delivery_notes
    `, [s.id, s.user_id, s.business_name, s.slug, s.whatsapp_number, s.phone, s.email, s.region, s.city, s.address, s.bio, s.commission_rate, s.status, s.delivery_notes]);
  }
  console.log(`Synced ${sellers.length} sellers to Supabase.`);

  // 2. Sync products
  const products = sqlite.prepare('SELECT * FROM products').all();
  for (const p of products) {
    await pool.query(`
      INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        seller_id = EXCLUDED.seller_id,
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        price_ghs = EXCLUDED.price_ghs,
        compare_price_ghs = EXCLUDED.compare_price_ghs,
        stock_quantity = EXCLUDED.stock_quantity,
        is_featured = EXCLUDED.is_featured,
        sku = EXCLUDED.sku,
        specifications = EXCLUDED.specifications,
        delivery_info = EXCLUDED.delivery_info
    `, [p.id, p.seller_id, p.category_id, p.name, p.slug, p.description, p.price_ghs, p.compare_price_ghs, p.stock_quantity, p.is_unlimited_stock, p.status, p.is_featured, p.sku, p.specifications, p.delivery_info, p.views_count]);
  }
  console.log(`Synced ${products.length} products to Supabase.`);

  // 3. Sync product images
  const images = sqlite.prepare('SELECT * FROM product_images').all();
  await pool.query('DELETE FROM noleya_product_images');
  for (const img of images) {
    await pool.query(`
      INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        image_url = EXCLUDED.image_url,
        thumbnail_url = EXCLUDED.thumbnail_url,
        alt_text = EXCLUDED.alt_text,
        display_order = EXCLUDED.display_order,
        is_primary = EXCLUDED.is_primary
    `, [img.id, img.product_id, img.image_url, img.thumbnail_url, img.alt_text, img.display_order, img.is_primary]);
  }
  console.log(`Synced ${images.length} product images to Supabase.`);

  // Reset sequences
  await pool.query(`
    SELECT setval('noleya_sellers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM noleya_sellers));
    SELECT setval('noleya_products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM noleya_products));
    SELECT setval('noleya_product_images_id_seq', (SELECT COALESCE(MAX(id), 1) FROM noleya_product_images));
  `);

  const res = await pool.query('SELECT COUNT(*) as count FROM noleya_products');
  console.log('Confirmed noleya_products count in Supabase:', res.rows[0].count);

  await pool.end();
  console.log('=== Supabase Cloud Sync Completed Successfully ===');
}

sync().catch(console.error);
