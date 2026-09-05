const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/noleya.db');

// 1. Minoxidil: GH₵ 100
db.prepare('UPDATE products SET price_ghs = 100 WHERE id = 1').run();
console.log('Updated Product 1 Minoxidil -> GH₵ 100');

// 2. Complete Beard & Hair Regrowth System
db.prepare('UPDATE products SET price_ghs = 300 WHERE id = 2').run();
console.log('Updated Product 2 Bundle -> GH₵ 300');

// 3. Creatine Capsules: GH₵ 500
db.prepare('UPDATE products SET price_ghs = 500 WHERE id = 3').run();
console.log('Updated Product 3 Creatine -> GH₵ 500');

// 4. Slim Smart Ranges: GH₵ 220
db.prepare('UPDATE products SET price_ghs = 220 WHERE id IN (4, 7)').run();
console.log('Updated Products 4 & 7 Slim Smart Ranges -> GH₵ 220');

// 5. Freeflex: GH₵ 300
db.prepare('UPDATE products SET price_ghs = 300 WHERE id = 5').run();
console.log('Updated Product 5 Freeflex -> GH₵ 300');

// 6. Nutri Glow: GH₵ 120
db.prepare('UPDATE products SET price_ghs = 120 WHERE id = 8').run();
console.log('Updated Product 8 Nutri Glow -> GH₵ 120');

// 7. Vitafizz: GH₵ 110
db.prepare('UPDATE products SET price_ghs = 110 WHERE id = 10').run();
console.log('Updated Product 10 Vitafizz -> GH₵ 110');

// 8. Man Up: GH₵ 300
db.prepare('UPDATE products SET price_ghs = 300 WHERE id = 11').run();
console.log('Updated Product 11 Man Up -> GH₵ 300');

// 9. Whey Protein: GH₵ 500
db.prepare('UPDATE products SET price_ghs = 500 WHERE id = 12').run();
console.log('Updated Product 12 Whey Protein -> GH₵ 500');

// Standalone Biotin: GH₵ 150
const existingBiotin = db.prepare("SELECT id FROM products WHERE slug = 'puritans-pride-biotin-10000mcg'").get();
if (!existingBiotin) {
  const insertStmt = db.prepare(`
    INSERT INTO products (seller_id, category_id, name, slug, description, price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const resBiotin = insertStmt.run(
    1,
    1,
    "Puritan's Pride Biotin 10,000mcg Hair, Skin & Nails Formula (50 Softgels)",
    "puritans-pride-biotin-10000mcg",
    "High-potency cellular nourishment promoting keratin synthesis, healthy hair growth, and strong nails. Imported from USA.",
    150.00,
    30,
    0,
    "published",
    1,
    "LUEX-BIO-10K",
    JSON.stringify({ "Strength": "10,000 mcg Vitamin B7", "Quantity": "50 Rapid Release Softgels", "Origin": "USA" }),
    "Same-day delivery across Greater Accra; 24-48h nationwide delivery.",
    15
  );
  const biotinId = Number(resBiotin.lastInsertRowid);
  db.prepare(`
    INSERT INTO product_images (product_id, image_url, thumbnail_url, alt_text, display_order, is_primary)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(biotinId, '/uploads/products/img_12.39.42_pm_1.jpeg', '/uploads/products/thumbs/thumb_img_12.39.42_pm_1.jpeg', "Puritan's Pride Biotin 10,000mcg", 1, 1);
  console.log('Created standalone Biotin product -> GH₵ 150 (ID: ' + biotinId + ')');
} else {
  db.prepare('UPDATE products SET price_ghs = 150 WHERE id = ?').run(existingBiotin.id);
  console.log('Updated standalone Biotin product -> GH₵ 150');
}

// Standalone Derma Roller: GH₵ 50
const existingDerma = db.prepare("SELECT id FROM products WHERE slug = 'titanium-micro-needle-derma-roller-0-5mm'").get();
if (!existingDerma) {
  const insertStmt2 = db.prepare(`
    INSERT INTO products (seller_id, category_id, name, slug, description, price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const resDerma = insertStmt2.run(
    1,
    3,
    "Titanium 540 Micro-Needle Beard & Hair Follicle Derma Roller (0.5mm)",
    "titanium-micro-needle-derma-roller-0-5mm",
    "Premium 540 micro-needle roller designed to stimulate blood circulation and enhance absorption of hair and beard regrowth topicals.",
    50.00,
    45,
    0,
    "published",
    1,
    "LUEX-DERMA-05",
    JSON.stringify({ "Needle Material": "Medical Titanium", "Needle Length": "0.5mm", "Total Needles": "540" }),
    "Same-day delivery across Accra; nationwide courier dispatch.",
    22
  );
  const dermaId = Number(resDerma.lastInsertRowid);
  db.prepare(`
    INSERT INTO product_images (product_id, image_url, thumbnail_url, alt_text, display_order, is_primary)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(dermaId, '/uploads/products/img_12.39.42_pm_2.jpeg', '/uploads/products/thumbs/thumb_img_12.39.42_pm_2.jpeg', "Titanium 540 Derma Roller 0.5mm", 1, 1);
  console.log('Created standalone Derma Roller product -> GH₵ 50 (ID: ' + dermaId + ')');
} else {
  db.prepare('UPDATE products SET price_ghs = 50 WHERE id = ?').run(existingDerma.id);
  console.log('Updated standalone Derma Roller product -> GH₵ 50');
}

db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
db.close();
console.log('--- Price list successfully applied to SQLite ---');
