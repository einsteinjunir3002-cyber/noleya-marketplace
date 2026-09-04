const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');

const db = new DatabaseSync('./data/noleya.db');

let sql = `-- ====================================================
-- NOLÉYA MARKETPLACE — SUPABASE POSTGRESQL SCHEMA & SEED
-- ====================================================

CREATE TABLE IF NOT EXISTS noleya_users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  status TEXT NOT NULL DEFAULT 'active',
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_sellers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES noleya_users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  whatsapp_number TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  region TEXT NOT NULL,
  city TEXT,
  address TEXT,
  bio TEXT,
  logo_url TEXT,
  banner_url TEXT,
  commission_rate NUMERIC DEFAULT 0.05,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_seller_applications (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT,
  category_name TEXT NOT NULL,
  product_samples TEXT,
  delivery_options TEXT,
  social_media TEXT,
  business_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_regions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  capital TEXT
);

CREATE TABLE IF NOT EXISTS noleya_products (
  id BIGSERIAL PRIMARY KEY,
  seller_id BIGINT NOT NULL REFERENCES noleya_sellers(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES noleya_categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price_ghs NUMERIC NOT NULL,
  compare_price_ghs NUMERIC,
  stock_quantity INTEGER NOT NULL DEFAULT 1,
  is_unlimited_stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  is_featured INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  specifications TEXT,
  delivery_info TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES noleya_products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_order_enquiries (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES noleya_products(id) ON DELETE SET NULL,
  seller_id BIGINT REFERENCES noleya_sellers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_location TEXT,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'direct_inquiry',
  status TEXT NOT NULL DEFAULT 'lead_initiated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_foundation_impact (
  id BIGSERIAL PRIMARY KEY,
  initiative_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  metric_label TEXT,
  metric_value TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noleya_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and public read for products, categories, regions, impact, settings
ALTER TABLE noleya_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_foundation_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_order_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE noleya_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read published products" ON noleya_products FOR SELECT USING (status = 'published');
CREATE POLICY "Allow public read product images" ON noleya_product_images FOR SELECT USING (true);
CREATE POLICY "Allow public read categories" ON noleya_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read regions" ON noleya_regions FOR SELECT USING (true);
CREATE POLICY "Allow public read approved sellers" ON noleya_sellers FOR SELECT USING (true);
CREATE POLICY "Allow public read impact" ON noleya_foundation_impact FOR SELECT USING (true);
CREATE POLICY "Allow public read settings" ON noleya_site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert order inquiries" ON noleya_order_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert seller applications" ON noleya_seller_applications FOR INSERT WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role full access products" ON noleya_products FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access images" ON noleya_product_images FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access categories" ON noleya_categories FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access regions" ON noleya_regions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access sellers" ON noleya_sellers FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access impact" ON noleya_foundation_impact FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access settings" ON noleya_site_settings FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access inquiries" ON noleya_order_enquiries FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access applications" ON noleya_seller_applications FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access users" ON noleya_users FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access logs" ON noleya_audit_logs FOR ALL TO service_role USING (true);

`;

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  return `'${String(val).replace(/'/g, "''")}'`;
}

// 1. Users
const users = db.prepare('SELECT * FROM users').all();
for (const u of users) {
  sql += `INSERT INTO noleya_users (id, email, username, password_hash, salt, name, phone, role, status, must_change_password) VALUES (${u.id}, ${escapeSql(u.email)}, ${escapeSql(u.username)}, ${escapeSql(u.password_hash)}, ${escapeSql(u.salt)}, ${escapeSql(u.name)}, ${escapeSql(u.phone)}, ${escapeSql(u.role)}, ${escapeSql(u.status)}, ${u.must_change_password}) ON CONFLICT (id) DO NOTHING;\n`;
}

// 2. Sellers
const sellers = db.prepare('SELECT * FROM sellers').all();
for (const s of sellers) {
  sql += `INSERT INTO noleya_sellers (id, user_id, business_name, slug, whatsapp_number, phone, email, region, city, address, bio, commission_rate, status, delivery_notes) VALUES (${s.id}, ${s.user_id}, ${escapeSql(s.business_name)}, ${escapeSql(s.slug)}, ${escapeSql(s.whatsapp_number)}, ${escapeSql(s.phone)}, ${escapeSql(s.email)}, ${escapeSql(s.region)}, ${escapeSql(s.city)}, ${escapeSql(s.address)}, ${escapeSql(s.bio)}, ${s.commission_rate}, ${escapeSql(s.status)}, ${escapeSql(s.delivery_notes)}) ON CONFLICT (id) DO NOTHING;\n`;
}

// 3. Categories
const categories = db.prepare('SELECT * FROM categories').all();
for (const c of categories) {
  sql += `INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (${c.id}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description)}, ${escapeSql(c.image_url)}, ${c.display_order}) ON CONFLICT (id) DO NOTHING;\n`;
}

// 4. Regions
const regions = db.prepare('SELECT * FROM regions').all();
for (const r of regions) {
  sql += `INSERT INTO noleya_regions (id, name, capital) VALUES (${r.id}, ${escapeSql(r.name)}, ${escapeSql(r.capital)}) ON CONFLICT (id) DO NOTHING;\n`;
}

// 5. Products
const products = db.prepare('SELECT * FROM products').all();
for (const p of products) {
  sql += `INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (${p.id}, ${p.seller_id}, ${p.category_id}, ${escapeSql(p.name)}, ${escapeSql(p.slug)}, ${escapeSql(p.description)}, ${p.price_ghs}, ${escapeSql(p.compare_price_ghs)}, ${p.stock_quantity}, ${p.is_unlimited_stock}, ${escapeSql(p.status)}, ${p.is_featured}, ${escapeSql(p.sku)}, ${escapeSql(p.specifications)}, ${escapeSql(p.delivery_info)}, ${p.views_count}) ON CONFLICT (id) DO NOTHING;\n`;
}

// 6. Product Images
const images = db.prepare('SELECT * FROM product_images').all();
for (const img of images) {
  sql += `INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (${img.id}, ${img.product_id}, ${escapeSql(img.image_url)}, ${escapeSql(img.thumbnail_url)}, ${escapeSql(img.alt_text)}, ${img.display_order}, ${img.is_primary}) ON CONFLICT (id) DO NOTHING;\n`;
}

// 7. Foundation Impact
const impacts = db.prepare('SELECT * FROM foundation_impact').all();
for (const imp of impacts) {
  sql += `INSERT INTO noleya_foundation_impact (id, initiative_name, slug, summary, description, image_url, metric_label, metric_value, status, display_order) VALUES (${imp.id}, ${escapeSql(imp.initiative_name)}, ${escapeSql(imp.slug)}, ${escapeSql(imp.summary)}, ${escapeSql(imp.description)}, ${escapeSql(imp.image_url)}, ${escapeSql(imp.metric_label)}, ${escapeSql(imp.metric_value)}, ${escapeSql(imp.status)}, ${imp.display_order}) ON CONFLICT (id) DO NOTHING;\n`;
}

// 8. Site Settings
const settings = db.prepare('SELECT * FROM site_settings').all();
for (const st of settings) {
  sql += `INSERT INTO noleya_site_settings (key, value, description) VALUES (${escapeSql(st.key)}, ${escapeSql(st.value)}, ${escapeSql(st.description)}) ON CONFLICT (key) DO UPDATE SET value = excluded.value;\n`;
}

// Reset Sequences
sql += `
SELECT setval('noleya_users_id_seq', (SELECT MAX(id) FROM noleya_users));
SELECT setval('noleya_sellers_id_seq', (SELECT MAX(id) FROM noleya_sellers));
SELECT setval('noleya_categories_id_seq', (SELECT MAX(id) FROM noleya_categories));
SELECT setval('noleya_regions_id_seq', (SELECT MAX(id) FROM noleya_regions));
SELECT setval('noleya_products_id_seq', (SELECT MAX(id) FROM noleya_products));
SELECT setval('noleya_product_images_id_seq', (SELECT MAX(id) FROM noleya_product_images));
SELECT setval('noleya_foundation_impact_id_seq', (SELECT MAX(id) FROM noleya_foundation_impact));
`;

fs.writeFileSync('./scripts/supabase_migration.sql', sql);
console.log('Successfully generated scripts/supabase_migration.sql. Total bytes:', sql.length);
