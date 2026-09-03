-- ====================================================
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
  capital TEXT NOT NULL
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

INSERT INTO noleya_users (id, email, username, password_hash, salt, name, phone, role, status, must_change_password) VALUES (1, 'FishyBetty', 'FishyBetty', '1fb17bcedb29cfd33699df9eb073d5f9efa21fd0d03e275f3a0a6030594fa35811ae30aada53d15204f98f071f404b70ebcc434a62336836f98813ec6f1df6cc', '37cb853fa12a923cda3a66732afa6234a0867da0e1e875b26a06b23df35450f1', 'Noléya Executive Admin', '0545811197', 'OWNER', 'active', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_users (id, email, username, password_hash, salt, name, phone, role, status, must_change_password) VALUES (2, 'luex@noleya.org', NULL, '70f1274e7ae52b3d3a83b31d74d2eb039471374d9d729d12f991fa28311a3993c58ef7ee19455a7a11dca13aef3a796950913cccb4d2ac5b1f76e530cf916a1b', '00864908f66a201cce8dadee542a8ceee39f44ef1b62b7d79e8203dca1f93fa5', 'Luex Healthcare Official', '0545811197', 'SELLER', 'active', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_users (id, email, username, password_hash, salt, name, phone, role, status, must_change_password) VALUES (3, 'etleather@noleya.org', NULL, 'f435b522ce0f8b37b7ec4ff227edfd992e908907566316ab3e42fc2cae61700736292ef7d9d4bd156397068f3c8e498463758ab2e11f297b108a039ed36da928', '461f32ade69b6d1d348ed936110e25049245044a9b52d4527d2c494bd1c2307f', 'ET Leather Collections Manager', '0204822847', 'SELLER', 'active', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_sellers (id, user_id, business_name, slug, whatsapp_number, phone, email, region, city, address, bio, commission_rate, status, delivery_notes) VALUES (1, 2, 'Luex Healthcare & Hollywood Nutritions', 'luex-healthcare-ghana', '0545811197', '0545811197', 'orders@luexhealthcare.com', 'Greater Accra', 'Accra', 'Osu / Oxford Street, Accra', 'Official distributor of Hollywood Nutritions, Luex Healthcare, and clinically formulated health & personal care products in Ghana.', 0.05, 'approved', 'Nationwide doorstep delivery via standard dispatch rider in Accra (same day/24h) and VIP courier across other regions (48h).') ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_sellers (id, user_id, business_name, slug, whatsapp_number, phone, email, region, city, address, bio, commission_rate, status, delivery_notes) VALUES (2, 3, 'ET Leather Collections Ghana', 'et-leather-collections', '0204822847', '0204822847', 'etleatherbags@gmail.com', 'Greater Accra', 'East Legon, Accra', 'Lagos Avenue, East Legon, Accra', 'Accra premier purveyor of luxury POMBELL designer handbags, textured satchels, executive totes, and leather accessories.', 0.05, 'approved', 'Free pickup in East Legon. Same-day delivery across Accra & Tema. Intercity express parcel delivery to Kumasi, Takoradi, Cape Coast, and Tamale.') ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (1, 'Health & Wellness', 'health-wellness', 'Vitamins, supplements, hair care, and nutritional formulas.', NULL, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (2, 'Bags & Handbags', 'bags', 'Luxury leather handbags, satchels, totes, wallets and accessories.', NULL, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (3, 'Beauty & Personal Care', 'beauty', 'Skin glow formulas, derma rollers, and rejuvenation essentials.', NULL, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (4, 'Fashion', 'fashion', 'Apparel, artisanal wear, and Ghanaian crafted fashion.', NULL, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (5, 'Shoes & Footwear', 'shoes', 'Handcrafted leather shoes, sandals, and formal footwear.', NULL, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (6, 'Jewellery & Watches', 'jewellery', 'Authentic Ghanaian jewellery, beads, and luxury timepieces.', NULL, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (7, 'Electronics', 'electronics', 'Phones, audio gear, and everyday electronic accessories.', NULL, 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (8, 'Home & Lifestyle', 'home', 'Living room decor, handcrafted homeware, and lifestyle goods.', NULL, 8) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (9, 'Gifts & Hampers', 'gifts', 'Curated hampers, corporate gifting, and special occasion presents.', NULL, 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_categories (id, name, slug, description, image_url, display_order) VALUES (10, 'Food & Groceries', 'food', 'Organic honey, local snacks, and authentic Ghanaian provisions.', NULL, 10) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (1, 'Greater Accra', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (2, 'Ashanti Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (3, 'Central Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (4, 'Eastern Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (5, 'Western Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (6, 'Western North', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (7, 'Volta Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (8, 'Oti Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (9, 'Northern Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (10, 'Savannah Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (11, 'North East Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (12, 'Upper East Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (13, 'Upper West Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (14, 'Bono Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (15, 'Bono East Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_regions (id, name, capital) VALUES (16, 'Ahafo Region', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (1, 1, 1, 'Kirkland Signature Minoxidil 5% Topical Solution (Men Hair Regrowth)', 'kirkland-minoxidil-5-hair-regrowth', 'Clinically proven extra-strength topical solution designed to reactivate shrunken hair follicles and stimulate new hair and beard growth. Comes with original precision dropper applicator. Recommended for daily application.', 220, 260, 35, 0, 'published', 1, NULL, '{"Volume":"60 ml (1 Bottle / 1 Month Supply)","Active Ingredient":"Minoxidil USP 5% Extra Strength","Formulation":"Unscented Topical Solution with Calibrated Dropper","Target Area":"Crown & Beard Hair Follicles","Origin":"USA (Kirkland Signature)"}', 'Same-day delivery across Greater Accra. 24–48 hours nationwide via VIP courier.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (2, 1, 1, 'Complete Beard & Hair Regrowth System (Minoxidil 5% + Biotin 10,000mcg + Derma Roller)', 'complete-beard-hair-regrowth-system', 'The definitive all-in-one grooming regimen for hair regrowth and thick beard development. Combining collagen-stimulating micro-needling, essential high-potency Biotin cellular nutrition, and extra-strength 5% Minoxidil solution.', 490, 580, 20, 0, 'published', 1, NULL, '{"Included In Box":"Kirkland Minoxidil 5% (60ml), Puritan''s Pride Biotin 10,000mcg (50 softgels), 540 Micro-Needle Derma Roller System","Treatment Cycle":"Full 30-Day Intensive Activation Bundle","Needle Length":"0.5mm Titanium Micro-needles","Biotin Strength":"Ultra Mega 10,000 mcg Vitamin B7"}', 'Fast nationwide delivery with tamper-proof packaging.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (3, 1, 1, 'MET-Rx Creatine 4200 Muscle Strength & Power Booster (240 Capsules)', 'met-rx-creatine-4200-capsules', 'MET-Rx Creatine 4200 provides 4.2g of pure creatine monohydrate per serving to boost explosive power, elevate workout threshold, and stimulate lean muscle growth during gym resistance workouts.', 350, 390, 18, 0, 'published', 1, NULL, '{"Quantity":"240 Fast-Release Capsules","Creatine Dose":"4,200 mg Pure Creatine Monohydrate per serving","Key Benefits":"Boosts Muscle Strength, Power, and Athletic Recovery","Brand":"MET-Rx"}', 'Available for immediate dispatch from Accra warehouse.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (4, 1, 1, 'Slim Smart Raspberry Ketones Appetite Control & Metabolism (60 Capsules)', 'slim-smart-raspberry-ketones', 'Clinically formulated with African Mango and concentrated green tea polyphenols to help curb food cravings, improve metabolic rate, and assist in trimming stubborn belly fat naturally.', 260, 310, 25, 0, 'published', 0, NULL, '{"Form":"60 Vegan Capsules","Active Botanical Blend":"Raspberry Ketones, African Mango, Green Tea Extract","Benefits":"Appetite Control, Fat Reduction, Thermogenic Metabolism","Brand":"Hollywood Nutritions / Luex"}', 'Doorstep dispatch in Accra, Kumasi, Takoradi, and Sunyani.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (5, 1, 1, 'Free Flex Ultra Comprehensive Joint Health Therapy (60 Capsules)', 'free-flex-ultra-joint-health', 'Move with strength and live without limits. Free Flex Ultra combines 19 pharmaceutical-grade natural ingredients including shark cartilage and green lipped mussel to alleviate joint stiffness and regenerate joint cartilage.', 280, 320, 30, 0, 'published', 0, NULL, '{"Key Ingredients":"Glucosamine, Chondroitin Sulphate, MSM, Green Lipped Sea Mussel, Shark Cartilage","Total Active Nutrients":"19 Joint Health Ingredients","Primary Focus":"Cartilage Protection, Ease Chronic Pain, Joint Lubrication","Origin":"Luex Healthcare / Hollywood Nutritions"}', 'Available nationwide with secure courier delivery.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (6, 1, 1, 'Ferrolex Syrup Blood Tonic Fortified with Iron, Folic Acid, B12 & Zinc (250ml)', 'ferrolex-blood-tonic-syrup-250ml', 'Complete haematinic therapy for iron deficiency anaemia. Fortified with essential blood-building micronutrients including zinc and B12. Highly recommended for expectant mothers, convalescent recovery, and growing youths.', 95, 115, 50, 0, 'published', 0, NULL, '{"Volume":"250 ml Liquid Tonic","Key Formula":"Ferrous Glycine Sulphate 300mg/10ml, Folic Acid 1mg, Iron 53mg, Zinc 80mg, Vitamin B12 5mcg","Indication":"Anaemia Therapy, Energy Rejuvenation, Pregnancy & Growth Support","Flavor":"Natural Sweet Orange"}', 'Accra express delivery within 4 hours. Available nationwide.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (7, 1, 1, 'Slim Smart Thermogenic Fat Burner Powered by Plants', 'slim-smart-fat-burner-powder', 'Harness the ancient potency of Ayurvedic thermogenic herbs. Accelerates fat breakdown, flushes excess bloating fluids, and promotes smooth digestive wellness.', 290, 340, 22, 0, 'published', 0, NULL, '{"Formulation":"100% Natural Botanical Herbal Thermogenic Powder","Ingredients":"Garcinia Cambogia, Ginger Root, Turmeric, Long Pepper, Green Tea, Haritaki, Fennel Seeds","Action":"Accelerates Metabolism, Relieves Bloating, Clean Digestion"}', 'Nationwide shipping from Accra.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (8, 1, 3, 'Nutri-Glow Radiate & Rejuvenate Hair, Skin & Nails Formula (30 Capsules)', 'nutri-glow-radiate-rejuvenate-capsules', 'Pharmacist-recommended beauty-from-within formula. Contains 32 synergistic vitamins and botanicals including glutathione and grape seed extract to even out skin tone, enhance elasticity, and fortify nail health.', 240, 280, 40, 0, 'published', 1, NULL, '{"Count":"30 Once-a-Day Capsules","Key Actives":"Biotin, Grape Seed Extract, Glutathione, Vitamin A, Vitamin C, Vitamin E","Total Nutrients":"32 Premium Bioactive Ingredients","Benefits":"Luminous Complexion, Strong Nails, Thick Healthy Hair"}', 'Dispatched in discreet protective packaging across Ghana.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (9, 1, 1, 'Ayurleaf Body Mass Weight Gainer Herbal Supplement (60 Capsules)', 'ayurleaf-weight-gainer-60-capsules', 'A gentle and holistic Ayurvedic herbal compound formulated to support healthy appetite stimulation, enhance metabolic absorption, and help underweight individuals build natural muscular body mass.', 190, 220, 28, 0, 'published', 0, NULL, '{"Capsule Count":"60 Herbal Capsules","Certification":"GMP Certified Ayurvedic Formulation","Primary Action":"Appetite Stimulation, Nutrient Uptake, Healthy Body Mass"}', 'Fast delivery across Ghana.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (10, 1, 1, 'Vita-Fizz Immune Support 1000mg Vitamin C + Zinc (20 Effervescent Tablets)', 'vita-fizz-immune-support-tablets', 'Supercharge your natural defenses with Vita-Fizz. Fast-acting effervescent drink providing 1000mg Vitamin C, Zinc, and Ayurvedic adaptogens to reduce fatigue and support mental vitality.', 120, 140, 60, 0, 'published', 1, NULL, '{"Tablets":"20 Effervescent Dissolvable Tablets","Potency":"1000 mg Vitamin C + High Bioavailability Zinc","Herbal Complex":"Ashwagandha, Tulsi, Brahmi Leaves, Amla, Ginger Root","Speed":"Fast Dissolution in Water in Under 30 Seconds"}', 'Accra same-day delivery. Nationwide shipping available.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (11, 1, 1, 'Hollywood Nutritions MAN-UP Advanced Vitality Formula (60 Capsules)', 'hollywood-nutritions-man-up-60-capsules', 'Empower your vitality, energy, and physical endurance. Crafted with premium natural adaptogens to promote healthy male circulation, stamina, and overall vigor.', 310, 360, 24, 0, 'published', 0, NULL, '{"Count":"60 Capsules","Formula":"Maximum Strength Male Enhancement & Vitality Formula","Ingredients":"100% Pure & Potent Natural Botanical Extracts","Certification":"Made in USA, Distributed by Luex Healthcare"}', 'Discreet 100% private packaging and fast delivery.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (12, 1, 1, 'Hollywood Nutritions High-Potency Whey Protein Sachets (BCAA 7000+)', 'hollywood-nutritions-whey-protein-sachets', 'Build strength with every scoop. Rapid-digesting whey protein sachets enriched with over 7,000mg branched-chain amino acids for optimal post-workout recovery and muscular lean tone.', 180, 210, 30, 0, 'published', 0, NULL, '{"Packaging":"Convenient Portable Multi-Serving Sachet Pack","Protein Content":"Ultra-Filtered Whey Protein Complex","Amino Acids":"7,000 mg BCAAs per serving","Function":"Rapid Muscle Recovery & Cellular Hydration"}', 'Available for immediate pickup or delivery.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (13, 2, 2, 'POMBELL F6723 Quilted Luxury Handbag & Wallet Set (33-13-23cm)', 'pombell-f6723-quilted-luxury-handbag', 'A masterclass in everyday luxury. The POMBELL F6723 features diamond-quilted leather, reinforced rolled carry handles, smooth zip entry, and an accompanying full-length continental wallet.', 380, 450, 15, 0, 'published', 1, NULL, '{"Dimensions":"33 cm (L) x 13 cm (W) x 23 cm (H)","Model":"F6723","Texture":"Diamond Quilted Embossed Calfskin Leather","Set Inclusions":"Structured Handbag, Detachable Shoulder Strap, Continental Snap Wallet","Colorways":"Black, Olive Green, Mustard Yellow, Navy, Purple, Tan, Beige, Wine Red"}', 'Free delivery within East Legon, Accra. Nationwide shipping within 48 hours.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (14, 2, 2, 'POMBELL K3315 Structured Flap Handbag with Continental Purse (30-11-23cm)', 'pombell-k3315-structured-flap-handbag', 'Clean architectural lines and modern elegance. The K3315 offers an iconic trapezoidal envelope flap secured by a polished gold lock, complemented by a matching color-matched wallet.', 360, 420, 14, 0, 'published', 1, NULL, '{"Dimensions":"30 cm x 11 cm x 23 cm","Model":"K3315","Hardware":"Brushed Gold Triangular Lock Mechanism","Interior":"Double Main Compartment with Center Zip Divider","Accessories":"Adjustable Crossbody Strap & Matching Designer Purse"}', 'Dispatched immediately from East Legon showroom.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (15, 2, 2, 'POMBELL F6698 Dual-Tone Colorblock Flap Handbag & Wallet (34-15-21cm)', 'pombell-f6698-colorblock-flap-handbag', 'Contemporary two-tone styling that turns heads. Spacious interior accommodates tablets, planners, and essentials with ease, accompanied by an executive matching wallet.', 370, 430, 12, 0, 'published', 0, NULL, '{"Dimensions":"34 cm x 15 cm x 21 cm","Model":"F6698","Design":"Two-Tone Colorblock with Architectural Oval Lock","Included":"Tote Satchel, Crossbody Strap, Long Zip Wallet"}', 'Doorstep dispatch across Accra, Kumasi, and Takoradi.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (16, 2, 2, 'POMBELL K3312 Center-Clasp Structured Handbag & Wallet (30-13-24cm)', 'pombell-k3312-center-clasp-handbag', 'Distinguished by a contrasting color center tongue and decorative lock hardware, this versatile satchel brings refined sophistication to any business or formal occasion.', 390, 450, 10, 0, 'published', 0, NULL, '{"Dimensions":"30 cm x 13 cm x 24 cm","Model":"K3312","Accent":"Contrast Center Flap with Teardrop Twist Clasp","Handle":"Sculpted Top Handle with Reinforced Edge Paint"}', 'Dispatched with protective dust bag.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (17, 2, 2, 'POMBELL F6702 Gold-Belt Accent Executive Handbag & Wallet (31-12-21cm)', 'pombell-f6702-gold-belt-executive-handbag', 'Impeccable executive silhouette embellished with twin polished gold belt ornaments across the front panel. Includes matching continental wallet and shoulder strap.', 375, 440, 16, 0, 'published', 0, NULL, '{"Dimensions":"31 cm x 12 cm x 21 cm","Model":"F6702","Detail":"Twin Buckle Gold-Tone Belt Strap Accents","Structure":"Stiffened Base with Protective Metal Feet"}', 'Nationwide courier delivery.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (18, 2, 2, 'POMBELL 3313 V-Flap Braided Chain Handbag & Long Wallet (33-12-19cm)', 'pombell-3313-v-flap-chain-handbag', 'One of POMBELL''s most coveted designs. Features a striking chevron V-flap bordered with dark gunmetal braided chainwork, complemented by an opulent curb-chain handle.', 385, 460, 18, 0, 'published', 1, NULL, '{"Dimensions":"33 cm x 12 cm x 19 cm","Model":"3313","Flap":"V-Cut Envelope with Inset Braided Curb Chain","Handle":"Leather-Wrapped Curb Chain Top Handle","Set":"Handbag, Crossbody Strap, Full-Length Continental Purse"}', 'Accra same-day delivery. Secure regional courier.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (19, 2, 2, 'POMBELL K8806# Basket-Weave Textured Leather Handbag & Wallet (32-12-23cm)', 'pombell-k8806-textured-woven-handbag', 'Artisanal texture meets executive poise. The textured basket-weave lower panel contrasts harmoniously against silky-smooth calfskin leather, anchored by a signature oval clasp.', 395, 470, 15, 0, 'published', 1, NULL, '{"Dimensions":"32 cm x 12 cm x 23 cm","Model":"K8806#","Material":"Intricate Basket-Weave Textured Lower Body & Smooth Calfskin Flap","Clasp":"Polished Oval Twist-Lock","Wallet":"Matching Zip-Around Leather Continental Wallet"}', 'Available for immediate delivery across Ghana.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (20, 2, 2, 'POMBELL F6727 Executive Tote Bag with Signature Tag & Wallet (31-14-24cm)', 'pombell-f6727-executive-tote-handbag', 'Spacious, commanding, and impeccably finished. Designed for professional women who carry their world with grace. Accommodates paperwork, makeup kits, and everyday essentials.', 410, 480, 11, 0, 'published', 0, NULL, '{"Dimensions":"31 cm x 14 cm x 24 cm","Model":"F6727","Style":"Structured Executive Carryall Tote","Details":"Vertical Chevron Topstitching, Debossed Leather Hangtag, Matching Clutch Wallet"}', 'Free shipping on orders within Greater Accra.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (21, 2, 2, 'POMBELL L18005 Braided Handle Satchel Handbag & Wallet (30-13-22cm)', 'pombell-l18005-braided-handle-satchel', 'Inspired by classic vintage doctor satchels, featuring an exquisite tubular hand-braided arch handle and a modern hinged top frame clasp for effortless access.', 390, 450, 13, 0, 'published', 0, NULL, '{"Dimensions":"30 cm x 13 cm x 22 cm","Model":"L18005","Handle":"Artisanal Hand-Braided Rounded Arch Top Handle","Closure":"Top Push-Button Hinged Frame Clasp"}', 'Prompt doorstep delivery via dispatch rider.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (22, 2, 2, 'POMBELL F6685 Envelope Flap Shoulder Bag & Mini Chain Pouch (31-14-33cm)', 'pombell-f6685-envelope-flap-shoulder-bag', 'An ingenious 2-in-1 combo. A sleek envelope flap shoulder bag accompanied by a detachable mini crossbody pouch on a golden curb chain for quick evening transitions.', 380, 440, 14, 0, 'published', 0, NULL, '{"Dimensions":"31 cm x 14 cm x 33 cm","Model":"F6685","Versatility":"2-in-1 Dual Bag Set (Main Shoulder Bag + Detachable Mini Chain Pouch)","Strap":"Wide Ergonomic Leather Shoulder Strap"}', 'Available across all regions in Ghana.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (23, 2, 2, 'POMBELL F6716 Chain-Link Strap Crossbody Shoulder Bag & Wallet (30-12-22cm)', 'pombell-f6716-chain-strap-shoulder-bag', 'A striking statement handbag engineered for seamless transitions from day meetings to evening dinners. Includes matching zippered wallet and detachable long strap.', 365, 430, 15, 0, 'published', 0, NULL, '{"Dimensions":"30 cm x 12 cm x 22 cm","Model":"F6716","Chain":"High-Gloss Gunmetal Shoulder Chain with Leather Shoulder Rest","Clasp":"Heavy-Duty Rectangular Center Buckle"}', 'Fast delivery across Greater Accra and beyond.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (24, 2, 2, 'POMBELL F6700 Hand-Stitched Flap Chain Bag with Half-Moon Mini Bag (31-13-20cm)', 'pombell-f6700-stitched-flap-chain-bag', 'Unique artisanal whipstitching accents the contour of the front flap. Comes packaged with an adorable half-moon mini bag that can be carried separately or hooked as a charm.', 370, 430, 12, 0, 'published', 0, NULL, '{"Dimensions":"31 cm x 13 cm x 20 cm","Model":"F6700","Craftsmanship":"Edge Whipstitch Hand Detail along Flap Border","Bonus Item":"Detachable Half-Moon Petite Saddle Bag"}', 'Dispatched with care from East Legon, Accra.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (25, 2, 2, 'Architectural Geometric Winged Leather Handbag & Wallet Set', 'architectural-geometric-winged-handbag', 'A daring, sculptural silhouette that commands attention wherever you go. Precision diagonal chevron leather cuts fold outward into flared wings, finished with an artisan braided handle.', 420, 490, 10, 0, 'published', 1, NULL, '{"Design":"Origami-Inspired Winged Silhouette with Chevron Paneling","Material":"Full Grain Pebble Leather Body with Smooth Trim","Handle":"Hand-Braided Corded Arch Top Handle","Accessories":"Adjustable Shoulder Strap & Matching Continental Zip Wallet"}', 'Premium nationwide delivery in protective storage bag.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (26, 2, 2, 'POMBELL Classic Dome Bowling Satchel & Wallet with Crossbody Strap', 'pombell-classic-dome-bowling-satchel', 'A silhouette inspired by timeless Parisian luxury travel luggage. Spacious curved dome opens wide for effortless packing, secured by dual heavy-duty zips and a turnlock front accent.', 385, 450, 16, 0, 'published', 1, NULL, '{"Silhouette":"Classic Curved Dome Bowling Bag","Hardware":"Twist Padlock Front Lock and Extended Two-Way Zippers","Included":"Satchel, Adjustable Long Strap, Full-Length Continental Wallet","Colors":"Olive Green, Dusty Lavender, Burgundy, Camel Tan, Sky Blue, Noir Black, Espresso Brown"}', 'Same day dispatch in Greater Accra.', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (27, 2, 2, 'POMBELL L18010 Asymmetric Wave-Flap Top Handle Handbag & Wallet (29-14-20cm)', 'pombell-l18010-asymmetric-flap-handbag', 'Break away from symmetry with the striking L18010. Its organic wave flap contours down into a vertical keyhole twist lock, highlighted by contrast edge trim.', 375, 440, 14, 0, 'published', 0, NULL, '{"Dimensions":"29 cm x 14 cm x 20 cm","Model":"L18010","Cut":"Dynamic Asymmetric Wave Front Flap with Contrast Binding","Lock":"Modern Vertical Keyhole Twist Latch","Wallet":"Matching Snap-Button Continental Leather Wallet"}', 'Fast delivery across Ghana.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_products (id, seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count) VALUES (28, 2, 2, 'ET Leather Collections Seasonal Showcase Lineup', 'et-leather-collections-showcase', 'Explore the full range of authentic ET Leather fashion bags available in Accra. Choose from rich hues in olive green, vibrant yellow, royal purple, burgundy, and classic midnight black.', 380, 450, 25, 0, 'published', 0, NULL, '{"Collection":"ET Leather Fashion Bags Verified Accra Inventory","Varieties":"Quilted Luxury, Top-Handle Satchels, Flap Shoulder Bags, Totes","Origin":"Guaranteed Genuine ET Leather Fashion Bags Stock"}', 'Immediate pickup in East Legon or courier dispatch nationwide.', 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (1, 1, '/uploads/products/img_12.39.41_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.39.41_pm.jpeg', 'Kirkland Signature Minoxidil 5% Topical Solution (Men Hair Regrowth)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (2, 2, '/uploads/products/img_12.39.42_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.39.42_pm.jpeg', 'Complete Beard & Hair Regrowth System (Minoxidil 5% + Biotin 10,000mcg + Derma Roller)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (3, 2, '/uploads/products/img_12.39.42_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.39.42_pm_1.jpeg', 'Complete Beard & Hair Regrowth System (Minoxidil 5% + Biotin 10,000mcg + Derma Roller)', 1, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (4, 2, '/uploads/products/img_12.39.42_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.39.42_pm_2.jpeg', 'Complete Beard & Hair Regrowth System (Minoxidil 5% + Biotin 10,000mcg + Derma Roller)', 2, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (5, 3, '/uploads/products/img_12.39.42_pm_4.jpeg', '/uploads/products/thumbs/thumb_img_12.39.42_pm_4.jpeg', 'MET-Rx Creatine 4200 Muscle Strength & Power Booster (240 Capsules)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (6, 4, '/uploads/products/img_12.39.42_pm_3.jpeg', '/uploads/products/thumbs/thumb_img_12.39.42_pm_3.jpeg', 'Slim Smart Raspberry Ketones Appetite Control & Metabolism (60 Capsules)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (7, 5, '/uploads/products/img_12.39.43_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.39.43_pm_1.jpeg', 'Free Flex Ultra Comprehensive Joint Health Therapy (60 Capsules)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (8, 6, '/uploads/products/img_12.39.43_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.39.43_pm_2.jpeg', 'Ferrolex Syrup Blood Tonic Fortified with Iron, Folic Acid, B12 & Zinc (250ml)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (9, 7, '/uploads/products/img_12.39.43_pm_3.jpeg', '/uploads/products/thumbs/thumb_img_12.39.43_pm_3.jpeg', 'Slim Smart Thermogenic Fat Burner Powered by Plants', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (10, 8, '/uploads/products/img_12.39.43_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.39.43_pm.jpeg', 'Nutri-Glow Radiate & Rejuvenate Hair, Skin & Nails Formula (30 Capsules)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (11, 8, '/uploads/products/img_12.39.44_pm_3.jpeg', '/uploads/products/thumbs/thumb_img_12.39.44_pm_3.jpeg', 'Nutri-Glow Radiate & Rejuvenate Hair, Skin & Nails Formula (30 Capsules)', 1, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (12, 8, '/uploads/products/img_12.39.45_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.39.45_pm_1.jpeg', 'Nutri-Glow Radiate & Rejuvenate Hair, Skin & Nails Formula (30 Capsules)', 2, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (13, 9, '/uploads/products/img_12.39.44_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.39.44_pm_1.jpeg', 'Ayurleaf Body Mass Weight Gainer Herbal Supplement (60 Capsules)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (14, 10, '/uploads/products/img_12.39.44_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.39.44_pm_2.jpeg', 'Vita-Fizz Immune Support 1000mg Vitamin C + Zinc (20 Effervescent Tablets)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (15, 10, '/uploads/products/img_12.39.44_pm_4.jpeg', '/uploads/products/thumbs/thumb_img_12.39.44_pm_4.jpeg', 'Vita-Fizz Immune Support 1000mg Vitamin C + Zinc (20 Effervescent Tablets)', 1, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (16, 10, '/uploads/products/img_12.39.45_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.39.45_pm.jpeg', 'Vita-Fizz Immune Support 1000mg Vitamin C + Zinc (20 Effervescent Tablets)', 2, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (17, 11, '/uploads/products/img_12.39.44_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.39.44_pm.jpeg', 'Hollywood Nutritions MAN-UP Advanced Vitality Formula (60 Capsules)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (18, 12, '/uploads/products/img_12.39.45_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.39.45_pm_2.jpeg', 'Hollywood Nutritions High-Potency Whey Protein Sachets (BCAA 7000+)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (19, 13, '/uploads/products/img_12.40.13_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.40.13_pm.jpeg', 'POMBELL F6723 Quilted Luxury Handbag & Wallet Set (33-13-23cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (20, 14, '/uploads/products/img_12.40.14_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.40.14_pm.jpeg', 'POMBELL K3315 Structured Flap Handbag with Continental Purse (30-11-23cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (21, 14, '/uploads/products/img_12.40.15_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.40.15_pm_1.jpeg', 'POMBELL K3315 Structured Flap Handbag with Continental Purse (30-11-23cm)', 1, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (22, 15, '/uploads/products/img_12.40.14_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.40.14_pm_1.jpeg', 'POMBELL F6698 Dual-Tone Colorblock Flap Handbag & Wallet (34-15-21cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (23, 16, '/uploads/products/img_12.40.14_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.40.14_pm_2.jpeg', 'POMBELL K3312 Center-Clasp Structured Handbag & Wallet (30-13-24cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (24, 17, '/uploads/products/img_12.40.14_pm_3.jpeg', '/uploads/products/thumbs/thumb_img_12.40.14_pm_3.jpeg', 'POMBELL F6702 Gold-Belt Accent Executive Handbag & Wallet (31-12-21cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (25, 18, '/uploads/products/img_12.40.17_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.40.17_pm.jpeg', 'POMBELL 3313 V-Flap Braided Chain Handbag & Long Wallet (33-12-19cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (26, 18, '/uploads/products/img_12.40.15_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.40.15_pm_2.jpeg', 'POMBELL 3313 V-Flap Braided Chain Handbag & Long Wallet (33-12-19cm)', 1, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (27, 19, '/uploads/products/img_12.40.15_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.40.15_pm.jpeg', 'POMBELL K8806# Basket-Weave Textured Leather Handbag & Wallet (32-12-23cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (28, 20, '/uploads/products/img_12.40.16_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.40.16_pm_1.jpeg', 'POMBELL F6727 Executive Tote Bag with Signature Tag & Wallet (31-14-24cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (29, 21, '/uploads/products/img_12.40.16_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.40.16_pm_2.jpeg', 'POMBELL L18005 Braided Handle Satchel Handbag & Wallet (30-13-22cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (30, 22, '/uploads/products/img_12.40.16_pm_3.jpeg', '/uploads/products/thumbs/thumb_img_12.40.16_pm_3.jpeg', 'POMBELL F6685 Envelope Flap Shoulder Bag & Mini Chain Pouch (31-14-33cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (31, 23, '/uploads/products/img_12.40.16_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.40.16_pm.jpeg', 'POMBELL F6716 Chain-Link Strap Crossbody Shoulder Bag & Wallet (30-12-22cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (32, 24, '/uploads/products/img_12.40.17_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.40.17_pm_1.jpeg', 'POMBELL F6700 Hand-Stitched Flap Chain Bag with Half-Moon Mini Bag (31-13-20cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (33, 25, '/uploads/products/img_12.40.17_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.40.17_pm_2.jpeg', 'Architectural Geometric Winged Leather Handbag & Wallet Set', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (34, 26, '/uploads/products/img_12.40.18_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.40.18_pm_1.jpeg', 'POMBELL Classic Dome Bowling Satchel & Wallet with Crossbody Strap', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (35, 26, '/uploads/products/img_12.40.18_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.40.18_pm_2.jpeg', 'POMBELL Classic Dome Bowling Satchel & Wallet with Crossbody Strap', 1, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (36, 27, '/uploads/products/img_12.40.18_pm.jpeg', '/uploads/products/thumbs/thumb_img_12.40.18_pm.jpeg', 'POMBELL L18010 Asymmetric Wave-Flap Top Handle Handbag & Wallet (29-14-20cm)', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_product_images (id, product_id, image_url, thumbnail_url, alt_text, display_order, is_primary) VALUES (37, 28, '/uploads/products/img_12.40.17_pm_3.jpeg', '/uploads/products/thumbs/thumb_img_12.40.17_pm_3.jpeg', 'ET Leather Collections Seasonal Showcase Lineup', 0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_foundation_impact (id, initiative_name, slug, summary, description, image_url, metric_label, metric_value, status, display_order) VALUES (1, 'Community Youth Tutoring & Literacy Program', 'community-youth-tutoring', 'Providing free after-school literacy tutoring, school textbooks, and learning kits to primary school pupils in disadvantaged communities.', 'Education is the most powerful equalizer. Noléya Foundation''s literacy initiative partners with trained university tutors to deliver structured reading, writing, and STEM tutoring to children who would otherwise lack supplemental academic support.', '/uploads/products/img_12.39.43_pm.jpeg', 'Children Tutored', '420+ Pupils', 'active', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_foundation_impact (id, initiative_name, slug, summary, description, image_url, metric_label, metric_value, status, display_order) VALUES (2, 'School Shoes & Uniforms Distribution Drive', 'school-shoes-uniforms-drive', 'Equipping vulnerable primary and junior high school pupils with durable school shoes, bags, and clean uniforms so they can attend school with dignity.', 'Countless bright students in rural districts face attendance barriers simply because they lack proper footwear or basic school uniforms. Our annual distribution drive directly equips children with locally crafted leather school shoes and uniforms.', '/uploads/products/img_12.40.16_pm_1.jpeg', 'Shoes & Uniforms Distributed', '850+ Pairs', 'active', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_foundation_impact (id, initiative_name, slug, summary, description, image_url, metric_label, metric_value, status, display_order) VALUES (3, 'Emergency Food & Nutrition Relief for Vulnerable Families', 'food-nutrition-relief', 'Delivering wholesome food staples, iron-fortified tonics, and nutritional packages to elderly citizens and impoverished families.', 'Noléya Foundation directly addresses food insecurity by delivering monthly staples, cooking essentials, and pediatric nutritional tonics to families facing acute economic distress in urban informal settlements.', '/uploads/products/img_12.39.43_pm_2.jpeg', 'Families Nourished', '1,200+ Households', 'active', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('site_title', 'Noléya Marketplace | Shop with purpose.', 'site_title') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('foundation_name', 'Noléya Foundation', 'foundation_name') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('foundation_tagline', 'Spreading joy. Restoring hope.', 'foundation_tagline') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('marketplace_tagline', 'Shop with purpose.', 'marketplace_tagline') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('hero_title', 'Discover Local Products. Empower Ghanaian Communities.', 'hero_title') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('hero_subtitle', 'Discover products from local businesses and independent sellers while supporting meaningful community initiatives through Noléya Foundation.', 'hero_subtitle') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('contact_phone_1', '0545811197', 'contact_phone_1') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('contact_phone_2', '0204822847', 'contact_phone_2') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('contact_email', 'Noléyafoundation@gmail.com', 'contact_email') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('contact_address', 'Accra, Greater Accra Region, Ghana', 'contact_address') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('foundation_relationship_text', 'Noléya Marketplace creates an opportunity for businesses and entrepreneurs to showcase their products while contributing to the work of Noléya Foundation. Every purchase empowers a local seller while helping fund community outreach, education, and healthcare support for vulnerable Ghanaians.', 'foundation_relationship_text') ON CONFLICT (key) DO UPDATE SET value = excluded.value;
INSERT INTO noleya_site_settings (key, value, description) VALUES ('seller_rules_text', '1. All products must be genuine, accurately photographed, and fairly priced.
2. Sellers must fulfill confirmed orders promptly with reliable contact information.
3. Prohibited, expired, or counterfeit goods will result in immediate permanent suspension.
4. Sellers commit to honoring the agreed 5% charitable contribution on confirmed marketplace orders to support Noléya Foundation community programs.', 'seller_rules_text') ON CONFLICT (key) DO UPDATE SET value = excluded.value;

SELECT setval('noleya_users_id_seq', (SELECT MAX(id) FROM noleya_users));
SELECT setval('noleya_sellers_id_seq', (SELECT MAX(id) FROM noleya_sellers));
SELECT setval('noleya_categories_id_seq', (SELECT MAX(id) FROM noleya_categories));
SELECT setval('noleya_regions_id_seq', (SELECT MAX(id) FROM noleya_regions));
SELECT setval('noleya_products_id_seq', (SELECT MAX(id) FROM noleya_products));
SELECT setval('noleya_product_images_id_seq', (SELECT MAX(id) FROM noleya_product_images));
SELECT setval('noleya_foundation_impact_id_seq', (SELECT MAX(id) FROM noleya_foundation_impact));
