import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { runMigrations } from '../src/lib/migrations';
import { getDb } from '../src/lib/db';

function hashPassword(password: string) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

async function seed() {
  console.log('--- Starting Noléya Marketplace Database Seeding ---');
  runMigrations();
  const db = getDb();

  // Create public uploads directories
  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', 'products');
  const thumbDir = path.resolve(process.cwd(), 'public', 'uploads', 'products', 'thumbs');
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(thumbDir, { recursive: true });

  const mediaSourceDir = path.resolve(process.cwd(), 'Media');
  console.log('Copying and generating thumbnails for real product images...');

  const imageMap: Record<string, { imageUrl: string; thumbnailUrl: string }> = {};
  if (fs.existsSync(mediaSourceDir)) {
    const files = fs.readdirSync(mediaSourceDir);
    for (const file of files) {
      if (!file.match(/\.(jpe?g|png|webp)$/i)) continue;
      const srcPath = path.join(mediaSourceDir, file);
      
      // Clean safe name for web
      const safeName = file
        .replace(/WhatsApp Image 2026-09-03 at /g, 'img_')
        .replace(/\s+/g, '_')
        .replace(/[()]/g, '')
        .toLowerCase();

      const destPath = path.join(uploadDir, safeName);
      const thumbPath = path.join(thumbDir, `thumb_${safeName}`);

      try {
        // Copy / optimize full size
        await sharp(srcPath)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .toFile(destPath);

        // Generate thumbnail
        await sharp(srcPath)
          .resize(450, 450, { fit: 'cover', position: 'center' })
          .toFile(thumbPath);

        imageMap[file] = {
          imageUrl: `/uploads/products/${safeName}`,
          thumbnailUrl: `/uploads/products/thumbs/thumb_${safeName}`,
        };
      } catch (err: any) {
        console.warn(`Warning copying image ${file}:`, err.message);
        // Fallback direct copy
        fs.copyFileSync(srcPath, destPath);
        fs.copyFileSync(srcPath, thumbPath);
        imageMap[file] = {
          imageUrl: `/uploads/products/${safeName}`,
          thumbnailUrl: `/uploads/products/thumbs/thumb_${safeName}`,
        };
      }
    }
  }

  console.log(`Processed ${Object.keys(imageMap).length} real product images.`);

  // 1. Ghanaian Administrative Regions
  const regions = [
    { name: 'Greater Accra', code: 'GAR' },
    { name: 'Ashanti Region', code: 'AR' },
    { name: 'Central Region', code: 'CR' },
    { name: 'Eastern Region', code: 'ER' },
    { name: 'Western Region', code: 'WR' },
    { name: 'Western North', code: 'WNR' },
    { name: 'Volta Region', code: 'VR' },
    { name: 'Oti Region', code: 'OR' },
    { name: 'Northern Region', code: 'NR' },
    { name: 'Savannah Region', code: 'SR' },
    { name: 'North East Region', code: 'NER' },
    { name: 'Upper East Region', code: 'UER' },
    { name: 'Upper West Region', code: 'UWR' },
    { name: 'Bono Region', code: 'BR' },
    { name: 'Bono East Region', code: 'BER' },
    { name: 'Ahafo Region', code: 'AHR' },
  ];

  for (const r of regions) {
    db.prepare(`
      INSERT OR IGNORE INTO regions (name, code, is_active)
      VALUES (?, ?, 1)
    `).run(r.name, r.code);
  }

  // 2. Categories
  const categories = [
    { name: 'Health & Wellness', slug: 'health-wellness', icon: 'HeartPulse', desc: 'Vitamins, supplements, hair care, and nutritional formulas.' },
    { name: 'Bags & Handbags', slug: 'bags', icon: 'ShoppingBag', desc: 'Luxury leather handbags, satchels, totes, wallets and accessories.' },
    { name: 'Beauty & Personal Care', slug: 'beauty', icon: 'Sparkles', desc: 'Skin glow formulas, derma rollers, and rejuvenation essentials.' },
    { name: 'Fashion', slug: 'fashion', icon: 'Shirt', desc: 'Apparel, artisanal wear, and Ghanaian crafted fashion.' },
    { name: 'Shoes & Footwear', slug: 'shoes', icon: 'Footprints', desc: 'Handcrafted leather shoes, sandals, and formal footwear.' },
    { name: 'Jewellery & Watches', slug: 'jewellery', icon: 'Gem', desc: 'Authentic Ghanaian jewellery, beads, and luxury timepieces.' },
    { name: 'Electronics', slug: 'electronics', icon: 'Cpu', desc: 'Phones, audio gear, and everyday electronic accessories.' },
    { name: 'Home & Lifestyle', slug: 'home', icon: 'Home', desc: 'Living room decor, handcrafted homeware, and lifestyle goods.' },
    { name: 'Gifts & Hampers', slug: 'gifts', icon: 'Gift', desc: 'Curated hampers, corporate gifting, and special occasion presents.' },
    { name: 'Food & Groceries', slug: 'food', icon: 'Utensils', desc: 'Organic honey, local snacks, and authentic Ghanaian provisions.' },
  ];

  const catMap: Record<string, number> = {};
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(c.slug) as { id: number } | undefined;
    if (existing) {
      catMap[c.slug] = existing.id;
    } else {
      const res = db.prepare(`
        INSERT INTO categories (name, slug, description, icon, display_order, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run(c.name, c.slug, c.desc, c.icon, i + 1);
      catMap[c.slug] = Number(res.lastInsertRowid);
    }
  }

  // 3. Owner Account
  const ownerEmail = process.env.INITIAL_OWNER_EMAIL || 'owner@noleya.org';
  const ownerPass = process.env.INITIAL_OWNER_PASSWORD || 'NoleyaAdmin2026#Secure!';
  const existingOwner = db.prepare('SELECT id FROM users WHERE email = ?').get(ownerEmail) as { id: number } | undefined;

  let ownerUserId: number;
  if (!existingOwner) {
    const { hash, salt } = hashPassword(ownerPass);
    const res = db.prepare(`
      INSERT INTO users (email, password_hash, salt, name, phone, role, status, must_change_password)
      VALUES (?, ?, ?, ?, ?, 'OWNER', 'active', 1)
    `).run(ownerEmail, hash, salt, 'Noléya Executive Admin', '0545811197');
    ownerUserId = Number(res.lastInsertRowid);
    console.log(`Created Initial Owner account: ${ownerEmail}`);
  } else {
    ownerUserId = existingOwner.id;
  }

  // 4. Initial Verified Sellers
  // Seller A: Luex Healthcare & Hollywood Nutritions Ghana
  const sellerAEmail = 'luex@noleya.org';
  let sellerAUserId: number;
  const existingUserA = db.prepare('SELECT id FROM users WHERE email = ?').get(sellerAEmail) as { id: number } | undefined;
  if (!existingUserA) {
    const { hash, salt } = hashPassword('LuexGhana2026!Secure');
    const res = db.prepare(`
      INSERT INTO users (email, password_hash, salt, name, phone, role, status, must_change_password)
      VALUES (?, ?, ?, ?, ?, 'SELLER', 'active', 0)
    `).run(sellerAEmail, hash, salt, 'Luex Healthcare Official', '0545811197');
    sellerAUserId = Number(res.lastInsertRowid);
  } else {
    sellerAUserId = existingUserA.id;
  }

  let sellerAId: number;
  const existingSellerA = db.prepare('SELECT id FROM sellers WHERE slug = ?').get('luex-healthcare-ghana') as { id: number } | undefined;
  if (!existingSellerA) {
    const res = db.prepare(`
      INSERT INTO sellers (user_id, business_name, slug, whatsapp_number, phone, email, region, city, address, bio, status, delivery_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
    `).run(
      sellerAUserId,
      'Luex Healthcare & Hollywood Nutritions',
      'luex-healthcare-ghana',
      '0545811197',
      '0545811197',
      'orders@luexhealthcare.com',
      'Greater Accra',
      'Accra',
      'Osu / Oxford Street, Accra',
      'Official distributor of Hollywood Nutritions, Luex Healthcare, and clinically formulated health & personal care products in Ghana.',
      'Nationwide doorstep delivery via standard dispatch rider in Accra (same day/24h) and VIP courier across other regions (48h).'
    );
    sellerAId = Number(res.lastInsertRowid);
  } else {
    sellerAId = existingSellerA.id;
  }

  // Seller B: ET Leather Collections Ghana
  const sellerBEmail = 'etleather@noleya.org';
  let sellerBUserId: number;
  const existingUserB = db.prepare('SELECT id FROM users WHERE email = ?').get(sellerBEmail) as { id: number } | undefined;
  if (!existingUserB) {
    const { hash, salt } = hashPassword('ETLeather2026!Secure');
    const res = db.prepare(`
      INSERT INTO users (email, password_hash, salt, name, phone, role, status, must_change_password)
      VALUES (?, ?, ?, ?, ?, 'SELLER', 'active', 0)
    `).run(sellerBEmail, hash, salt, 'ET Leather Collections Manager', '0204822847');
    sellerBUserId = Number(res.lastInsertRowid);
  } else {
    sellerBUserId = existingUserB.id;
  }

  let sellerBId: number;
  const existingSellerB = db.prepare('SELECT id FROM sellers WHERE slug = ?').get('et-leather-collections') as { id: number } | undefined;
  if (!existingSellerB) {
    const res = db.prepare(`
      INSERT INTO sellers (user_id, business_name, slug, whatsapp_number, phone, email, region, city, address, bio, status, delivery_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
    `).run(
      sellerBUserId,
      'ET Leather Collections Ghana',
      'et-leather-collections',
      '0204822847',
      '0204822847',
      'etleatherbags@gmail.com',
      'Greater Accra',
      'East Legon, Accra',
      'Lagos Avenue, East Legon, Accra',
      'Accra premier purveyor of luxury POMBELL designer handbags, textured satchels, executive totes, and leather accessories.',
      'Free pickup in East Legon. Same-day delivery across Accra & Tema. Intercity express parcel delivery to Kumasi, Takoradi, Cape Coast, and Tamale.'
    );
    sellerBId = Number(res.lastInsertRowid);
  } else {
    sellerBId = existingSellerB.id;
  }

  // 5. Seed Real Products from the 37 images
  const productsToSeed = [
    // Health & Wellness
    {
      name: 'Kirkland Signature Minoxidil 5% Topical Solution (Men Hair Regrowth)',
      slug: 'kirkland-minoxidil-5-hair-regrowth',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 220.00,
      comparePrice: 260.00,
      isFeatured: 1,
      stock: 35,
      specifications: JSON.stringify({
        'Volume': '60 ml (1 Bottle / 1 Month Supply)',
        'Active Ingredient': 'Minoxidil USP 5% Extra Strength',
        'Formulation': 'Unscented Topical Solution with Calibrated Dropper',
        'Target Area': 'Crown & Beard Hair Follicles',
        'Origin': 'USA (Kirkland Signature)'
      }),
      description: 'Clinically proven extra-strength topical solution designed to reactivate shrunken hair follicles and stimulate new hair and beard growth. Comes with original precision dropper applicator. Recommended for daily application.',
      deliveryInfo: 'Same-day delivery across Greater Accra. 24–48 hours nationwide via VIP courier.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.41 PM.jpeg'
      ]
    },
    {
      name: 'Complete Beard & Hair Regrowth System (Minoxidil 5% + Biotin 10,000mcg + Derma Roller)',
      slug: 'complete-beard-hair-regrowth-system',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 490.00,
      comparePrice: 580.00,
      isFeatured: 1,
      stock: 20,
      specifications: JSON.stringify({
        'Included In Box': 'Kirkland Minoxidil 5% (60ml), Puritan\'s Pride Biotin 10,000mcg (50 softgels), 540 Micro-Needle Derma Roller System',
        'Treatment Cycle': 'Full 30-Day Intensive Activation Bundle',
        'Needle Length': '0.5mm Titanium Micro-needles',
        'Biotin Strength': 'Ultra Mega 10,000 mcg Vitamin B7'
      }),
      description: 'The definitive all-in-one grooming regimen for hair regrowth and thick beard development. Combining collagen-stimulating micro-needling, essential high-potency Biotin cellular nutrition, and extra-strength 5% Minoxidil solution.',
      deliveryInfo: 'Fast nationwide delivery with tamper-proof packaging.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.42 PM.jpeg',
        'WhatsApp Image 2026-09-03 at 12.39.42 PM (1).jpeg',
        'WhatsApp Image 2026-09-03 at 12.39.42 PM (2).jpeg'
      ]
    },
    {
      name: 'MET-Rx Creatine 4200 Muscle Strength & Power Booster (240 Capsules)',
      slug: 'met-rx-creatine-4200-capsules',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 350.00,
      comparePrice: 390.00,
      isFeatured: 1,
      stock: 18,
      specifications: JSON.stringify({
        'Quantity': '240 Fast-Release Capsules',
        'Creatine Dose': '4,200 mg Pure Creatine Monohydrate per serving',
        'Key Benefits': 'Boosts Muscle Strength, Power, and Athletic Recovery',
        'Brand': 'MET-Rx'
      }),
      description: 'MET-Rx Creatine 4200 provides 4.2g of pure creatine monohydrate per serving to boost explosive power, elevate workout threshold, and stimulate lean muscle growth during gym resistance workouts.',
      deliveryInfo: 'Available for immediate dispatch from Accra warehouse.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.42 PM (4).jpeg'
      ]
    },
    {
      name: 'Slim Smart Raspberry Ketones Appetite Control & Metabolism (60 Capsules)',
      slug: 'slim-smart-raspberry-ketones',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 260.00,
      comparePrice: 310.00,
      isFeatured: 0,
      stock: 25,
      specifications: JSON.stringify({
        'Form': '60 Vegan Capsules',
        'Active Botanical Blend': 'Raspberry Ketones, African Mango, Green Tea Extract',
        'Benefits': 'Appetite Control, Fat Reduction, Thermogenic Metabolism',
        'Brand': 'Hollywood Nutritions / Luex'
      }),
      description: 'Clinically formulated with African Mango and concentrated green tea polyphenols to help curb food cravings, improve metabolic rate, and assist in trimming stubborn belly fat naturally.',
      deliveryInfo: 'Doorstep dispatch in Accra, Kumasi, Takoradi, and Sunyani.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.42 PM (3).jpeg'
      ]
    },
    {
      name: 'Free Flex Ultra Comprehensive Joint Health Therapy (60 Capsules)',
      slug: 'free-flex-ultra-joint-health',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 280.00,
      comparePrice: 320.00,
      isFeatured: 0,
      stock: 30,
      specifications: JSON.stringify({
        'Key Ingredients': 'Glucosamine, Chondroitin Sulphate, MSM, Green Lipped Sea Mussel, Shark Cartilage',
        'Total Active Nutrients': '19 Joint Health Ingredients',
        'Primary Focus': 'Cartilage Protection, Ease Chronic Pain, Joint Lubrication',
        'Origin': 'Luex Healthcare / Hollywood Nutritions'
      }),
      description: 'Move with strength and live without limits. Free Flex Ultra combines 19 pharmaceutical-grade natural ingredients including shark cartilage and green lipped mussel to alleviate joint stiffness and regenerate joint cartilage.',
      deliveryInfo: 'Available nationwide with secure courier delivery.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.43 PM (1).jpeg'
      ]
    },
    {
      name: 'Ferrolex Syrup Blood Tonic Fortified with Iron, Folic Acid, B12 & Zinc (250ml)',
      slug: 'ferrolex-blood-tonic-syrup-250ml',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 95.00,
      comparePrice: 115.00,
      isFeatured: 0,
      stock: 50,
      specifications: JSON.stringify({
        'Volume': '250 ml Liquid Tonic',
        'Key Formula': 'Ferrous Glycine Sulphate 300mg/10ml, Folic Acid 1mg, Iron 53mg, Zinc 80mg, Vitamin B12 5mcg',
        'Indication': 'Anaemia Therapy, Energy Rejuvenation, Pregnancy & Growth Support',
        'Flavor': 'Natural Sweet Orange'
      }),
      description: 'Complete haematinic therapy for iron deficiency anaemia. Fortified with essential blood-building micronutrients including zinc and B12. Highly recommended for expectant mothers, convalescent recovery, and growing youths.',
      deliveryInfo: 'Accra express delivery within 4 hours. Available nationwide.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.43 PM (2).jpeg'
      ]
    },
    {
      name: 'Slim Smart Thermogenic Fat Burner Powered by Plants',
      slug: 'slim-smart-fat-burner-powder',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 290.00,
      comparePrice: 340.00,
      isFeatured: 0,
      stock: 22,
      specifications: JSON.stringify({
        'Formulation': '100% Natural Botanical Herbal Thermogenic Powder',
        'Ingredients': 'Garcinia Cambogia, Ginger Root, Turmeric, Long Pepper, Green Tea, Haritaki, Fennel Seeds',
        'Action': 'Accelerates Metabolism, Relieves Bloating, Clean Digestion'
      }),
      description: 'Harness the ancient potency of Ayurvedic thermogenic herbs. Accelerates fat breakdown, flushes excess bloating fluids, and promotes smooth digestive wellness.',
      deliveryInfo: 'Nationwide shipping from Accra.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.43 PM (3).jpeg'
      ]
    },
    {
      name: 'Nutri-Glow Radiate & Rejuvenate Hair, Skin & Nails Formula (30 Capsules)',
      slug: 'nutri-glow-radiate-rejuvenate-capsules',
      sellerId: sellerAId,
      categoryId: catMap['beauty'],
      price: 240.00,
      comparePrice: 280.00,
      isFeatured: 1,
      stock: 40,
      specifications: JSON.stringify({
        'Count': '30 Once-a-Day Capsules',
        'Key Actives': 'Biotin, Grape Seed Extract, Glutathione, Vitamin A, Vitamin C, Vitamin E',
        'Total Nutrients': '32 Premium Bioactive Ingredients',
        'Benefits': 'Luminous Complexion, Strong Nails, Thick Healthy Hair'
      }),
      description: 'Pharmacist-recommended beauty-from-within formula. Contains 32 synergistic vitamins and botanicals including glutathione and grape seed extract to even out skin tone, enhance elasticity, and fortify nail health.',
      deliveryInfo: 'Dispatched in discreet protective packaging across Ghana.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.43 PM.jpeg',
        'WhatsApp Image 2026-09-03 at 12.39.44 PM (3).jpeg',
        'WhatsApp Image 2026-09-03 at 12.39.45 PM (1).jpeg'
      ]
    },
    {
      name: 'Ayurleaf Body Mass Weight Gainer Herbal Supplement (60 Capsules)',
      slug: 'ayurleaf-weight-gainer-60-capsules',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 190.00,
      comparePrice: 220.00,
      isFeatured: 0,
      stock: 28,
      specifications: JSON.stringify({
        'Capsule Count': '60 Herbal Capsules',
        'Certification': 'GMP Certified Ayurvedic Formulation',
        'Primary Action': 'Appetite Stimulation, Nutrient Uptake, Healthy Body Mass'
      }),
      description: 'A gentle and holistic Ayurvedic herbal compound formulated to support healthy appetite stimulation, enhance metabolic absorption, and help underweight individuals build natural muscular body mass.',
      deliveryInfo: 'Fast delivery across Ghana.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.44 PM (1).jpeg'
      ]
    },
    {
      name: 'Vita-Fizz Immune Support 1000mg Vitamin C + Zinc (20 Effervescent Tablets)',
      slug: 'vita-fizz-immune-support-tablets',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 120.00,
      comparePrice: 140.00,
      isFeatured: 1,
      stock: 60,
      specifications: JSON.stringify({
        'Tablets': '20 Effervescent Dissolvable Tablets',
        'Potency': '1000 mg Vitamin C + High Bioavailability Zinc',
        'Herbal Complex': 'Ashwagandha, Tulsi, Brahmi Leaves, Amla, Ginger Root',
        'Speed': 'Fast Dissolution in Water in Under 30 Seconds'
      }),
      description: 'Supercharge your natural defenses with Vita-Fizz. Fast-acting effervescent drink providing 1000mg Vitamin C, Zinc, and Ayurvedic adaptogens to reduce fatigue and support mental vitality.',
      deliveryInfo: 'Accra same-day delivery. Nationwide shipping available.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.44 PM (2).jpeg',
        'WhatsApp Image 2026-09-03 at 12.39.44 PM (4).jpeg',
        'WhatsApp Image 2026-09-03 at 12.39.45 PM.jpeg'
      ]
    },
    {
      name: 'Hollywood Nutritions MAN-UP Advanced Vitality Formula (60 Capsules)',
      slug: 'hollywood-nutritions-man-up-60-capsules',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 310.00,
      comparePrice: 360.00,
      isFeatured: 0,
      stock: 24,
      specifications: JSON.stringify({
        'Count': '60 Capsules',
        'Formula': 'Maximum Strength Male Enhancement & Vitality Formula',
        'Ingredients': '100% Pure & Potent Natural Botanical Extracts',
        'Certification': 'Made in USA, Distributed by Luex Healthcare'
      }),
      description: 'Empower your vitality, energy, and physical endurance. Crafted with premium natural adaptogens to promote healthy male circulation, stamina, and overall vigor.',
      deliveryInfo: 'Discreet 100% private packaging and fast delivery.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.44 PM.jpeg'
      ]
    },
    {
      name: 'Hollywood Nutritions High-Potency Whey Protein Sachets (BCAA 7000+)',
      slug: 'hollywood-nutritions-whey-protein-sachets',
      sellerId: sellerAId,
      categoryId: catMap['health-wellness'],
      price: 180.00,
      comparePrice: 210.00,
      isFeatured: 0,
      stock: 30,
      specifications: JSON.stringify({
        'Packaging': 'Convenient Portable Multi-Serving Sachet Pack',
        'Protein Content': 'Ultra-Filtered Whey Protein Complex',
        'Amino Acids': '7,000 mg BCAAs per serving',
        'Function': 'Rapid Muscle Recovery & Cellular Hydration'
      }),
      description: 'Build strength with every scoop. Rapid-digesting whey protein sachets enriched with over 7,000mg branched-chain amino acids for optimal post-workout recovery and muscular lean tone.',
      deliveryInfo: 'Available for immediate pickup or delivery.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.39.45 PM (2).jpeg'
      ]
    },

    // Fashion & Handbags (ET Leather Collections)
    {
      name: 'POMBELL F6723 Quilted Luxury Handbag & Wallet Set (33-13-23cm)',
      slug: 'pombell-f6723-quilted-luxury-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 380.00,
      comparePrice: 450.00,
      isFeatured: 1,
      stock: 15,
      specifications: JSON.stringify({
        'Dimensions': '33 cm (L) x 13 cm (W) x 23 cm (H)',
        'Model': 'F6723',
        'Texture': 'Diamond Quilted Embossed Calfskin Leather',
        'Set Inclusions': 'Structured Handbag, Detachable Shoulder Strap, Continental Snap Wallet',
        'Colorways': 'Black, Olive Green, Mustard Yellow, Navy, Purple, Tan, Beige, Wine Red'
      }),
      description: 'A masterclass in everyday luxury. The POMBELL F6723 features diamond-quilted leather, reinforced rolled carry handles, smooth zip entry, and an accompanying full-length continental wallet.',
      deliveryInfo: 'Free delivery within East Legon, Accra. Nationwide shipping within 48 hours.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.13 PM.jpeg'
      ]
    },
    {
      name: 'POMBELL K3315 Structured Flap Handbag with Continental Purse (30-11-23cm)',
      slug: 'pombell-k3315-structured-flap-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 360.00,
      comparePrice: 420.00,
      isFeatured: 1,
      stock: 14,
      specifications: JSON.stringify({
        'Dimensions': '30 cm x 11 cm x 23 cm',
        'Model': 'K3315',
        'Hardware': 'Brushed Gold Triangular Lock Mechanism',
        'Interior': 'Double Main Compartment with Center Zip Divider',
        'Accessories': 'Adjustable Crossbody Strap & Matching Designer Purse'
      }),
      description: 'Clean architectural lines and modern elegance. The K3315 offers an iconic trapezoidal envelope flap secured by a polished gold lock, complemented by a matching color-matched wallet.',
      deliveryInfo: 'Dispatched immediately from East Legon showroom.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.14 PM.jpeg',
        'WhatsApp Image 2026-09-03 at 12.40.15 PM (1).jpeg'
      ]
    },
    {
      name: 'POMBELL F6698 Dual-Tone Colorblock Flap Handbag & Wallet (34-15-21cm)',
      slug: 'pombell-f6698-colorblock-flap-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 370.00,
      comparePrice: 430.00,
      isFeatured: 0,
      stock: 12,
      specifications: JSON.stringify({
        'Dimensions': '34 cm x 15 cm x 21 cm',
        'Model': 'F6698',
        'Design': 'Two-Tone Colorblock with Architectural Oval Lock',
        'Included': 'Tote Satchel, Crossbody Strap, Long Zip Wallet'
      }),
      description: 'Contemporary two-tone styling that turns heads. Spacious interior accommodates tablets, planners, and essentials with ease, accompanied by an executive matching wallet.',
      deliveryInfo: 'Doorstep dispatch across Accra, Kumasi, and Takoradi.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.14 PM (1).jpeg'
      ]
    },
    {
      name: 'POMBELL K3312 Center-Clasp Structured Handbag & Wallet (30-13-24cm)',
      slug: 'pombell-k3312-center-clasp-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 390.00,
      comparePrice: 450.00,
      isFeatured: 0,
      stock: 10,
      specifications: JSON.stringify({
        'Dimensions': '30 cm x 13 cm x 24 cm',
        'Model': 'K3312',
        'Accent': 'Contrast Center Flap with Teardrop Twist Clasp',
        'Handle': 'Sculpted Top Handle with Reinforced Edge Paint'
      }),
      description: 'Distinguished by a contrasting color center tongue and decorative lock hardware, this versatile satchel brings refined sophistication to any business or formal occasion.',
      deliveryInfo: 'Dispatched with protective dust bag.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.14 PM (2).jpeg'
      ]
    },
    {
      name: 'POMBELL F6702 Gold-Belt Accent Executive Handbag & Wallet (31-12-21cm)',
      slug: 'pombell-f6702-gold-belt-executive-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 375.00,
      comparePrice: 440.00,
      isFeatured: 0,
      stock: 16,
      specifications: JSON.stringify({
        'Dimensions': '31 cm x 12 cm x 21 cm',
        'Model': 'F6702',
        'Detail': 'Twin Buckle Gold-Tone Belt Strap Accents',
        'Structure': 'Stiffened Base with Protective Metal Feet'
      }),
      description: 'Impeccable executive silhouette embellished with twin polished gold belt ornaments across the front panel. Includes matching continental wallet and shoulder strap.',
      deliveryInfo: 'Nationwide courier delivery.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.14 PM (3).jpeg'
      ]
    },
    {
      name: 'POMBELL 3313 V-Flap Braided Chain Handbag & Long Wallet (33-12-19cm)',
      slug: 'pombell-3313-v-flap-chain-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 385.00,
      comparePrice: 460.00,
      isFeatured: 1,
      stock: 18,
      specifications: JSON.stringify({
        'Dimensions': '33 cm x 12 cm x 19 cm',
        'Model': '3313',
        'Flap': 'V-Cut Envelope with Inset Braided Curb Chain',
        'Handle': 'Leather-Wrapped Curb Chain Top Handle',
        'Set': 'Handbag, Crossbody Strap, Full-Length Continental Purse'
      }),
      description: 'One of POMBELL\'s most coveted designs. Features a striking chevron V-flap bordered with dark gunmetal braided chainwork, complemented by an opulent curb-chain handle.',
      deliveryInfo: 'Accra same-day delivery. Secure regional courier.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.17 PM.jpeg',
        'WhatsApp Image 2026-09-03 at 12.40.15 PM (2).jpeg'
      ]
    },
    {
      name: 'POMBELL K8806# Basket-Weave Textured Leather Handbag & Wallet (32-12-23cm)',
      slug: 'pombell-k8806-textured-woven-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 395.00,
      comparePrice: 470.00,
      isFeatured: 1,
      stock: 15,
      specifications: JSON.stringify({
        'Dimensions': '32 cm x 12 cm x 23 cm',
        'Model': 'K8806#',
        'Material': 'Intricate Basket-Weave Textured Lower Body & Smooth Calfskin Flap',
        'Clasp': 'Polished Oval Twist-Lock',
        'Wallet': 'Matching Zip-Around Leather Continental Wallet'
      }),
      description: 'Artisanal texture meets executive poise. The textured basket-weave lower panel contrasts harmoniously against silky-smooth calfskin leather, anchored by a signature oval clasp.',
      deliveryInfo: 'Available for immediate delivery across Ghana.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.15 PM.jpeg'
      ]
    },
    {
      name: 'POMBELL F6727 Executive Tote Bag with Signature Tag & Wallet (31-14-24cm)',
      slug: 'pombell-f6727-executive-tote-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 410.00,
      comparePrice: 480.00,
      isFeatured: 0,
      stock: 11,
      specifications: JSON.stringify({
        'Dimensions': '31 cm x 14 cm x 24 cm',
        'Model': 'F6727',
        'Style': 'Structured Executive Carryall Tote',
        'Details': 'Vertical Chevron Topstitching, Debossed Leather Hangtag, Matching Clutch Wallet'
      }),
      description: 'Spacious, commanding, and impeccably finished. Designed for professional women who carry their world with grace. Accommodates paperwork, makeup kits, and everyday essentials.',
      deliveryInfo: 'Free shipping on orders within Greater Accra.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.16 PM (1).jpeg'
      ]
    },
    {
      name: 'POMBELL L18005 Braided Handle Satchel Handbag & Wallet (30-13-22cm)',
      slug: 'pombell-l18005-braided-handle-satchel',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 390.00,
      comparePrice: 450.00,
      isFeatured: 0,
      stock: 13,
      specifications: JSON.stringify({
        'Dimensions': '30 cm x 13 cm x 22 cm',
        'Model': 'L18005',
        'Handle': 'Artisanal Hand-Braided Rounded Arch Top Handle',
        'Closure': 'Top Push-Button Hinged Frame Clasp'
      }),
      description: 'Inspired by classic vintage doctor satchels, featuring an exquisite tubular hand-braided arch handle and a modern hinged top frame clasp for effortless access.',
      deliveryInfo: 'Prompt doorstep delivery via dispatch rider.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.16 PM (2).jpeg'
      ]
    },
    {
      name: 'POMBELL F6685 Envelope Flap Shoulder Bag & Mini Chain Pouch (31-14-33cm)',
      slug: 'pombell-f6685-envelope-flap-shoulder-bag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 380.00,
      comparePrice: 440.00,
      isFeatured: 0,
      stock: 14,
      specifications: JSON.stringify({
        'Dimensions': '31 cm x 14 cm x 33 cm',
        'Model': 'F6685',
        'Versatility': '2-in-1 Dual Bag Set (Main Shoulder Bag + Detachable Mini Chain Pouch)',
        'Strap': 'Wide Ergonomic Leather Shoulder Strap'
      }),
      description: 'An ingenious 2-in-1 combo. A sleek envelope flap shoulder bag accompanied by a detachable mini crossbody pouch on a golden curb chain for quick evening transitions.',
      deliveryInfo: 'Available across all regions in Ghana.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.16 PM (3).jpeg'
      ]
    },
    {
      name: 'POMBELL F6716 Chain-Link Strap Crossbody Shoulder Bag & Wallet (30-12-22cm)',
      slug: 'pombell-f6716-chain-strap-shoulder-bag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 365.00,
      comparePrice: 430.00,
      isFeatured: 0,
      stock: 15,
      specifications: JSON.stringify({
        'Dimensions': '30 cm x 12 cm x 22 cm',
        'Model': 'F6716',
        'Chain': 'High-Gloss Gunmetal Shoulder Chain with Leather Shoulder Rest',
        'Clasp': 'Heavy-Duty Rectangular Center Buckle'
      }),
      description: 'A striking statement handbag engineered for seamless transitions from day meetings to evening dinners. Includes matching zippered wallet and detachable long strap.',
      deliveryInfo: 'Fast delivery across Greater Accra and beyond.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.16 PM.jpeg'
      ]
    },
    {
      name: 'POMBELL F6700 Hand-Stitched Flap Chain Bag with Half-Moon Mini Bag (31-13-20cm)',
      slug: 'pombell-f6700-stitched-flap-chain-bag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 370.00,
      comparePrice: 430.00,
      isFeatured: 0,
      stock: 12,
      specifications: JSON.stringify({
        'Dimensions': '31 cm x 13 cm x 20 cm',
        'Model': 'F6700',
        'Craftsmanship': 'Edge Whipstitch Hand Detail along Flap Border',
        'Bonus Item': 'Detachable Half-Moon Petite Saddle Bag'
      }),
      description: 'Unique artisanal whipstitching accents the contour of the front flap. Comes packaged with an adorable half-moon mini bag that can be carried separately or hooked as a charm.',
      deliveryInfo: 'Dispatched with care from East Legon, Accra.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.17 PM (1).jpeg'
      ]
    },
    {
      name: 'Architectural Geometric Winged Leather Handbag & Wallet Set',
      slug: 'architectural-geometric-winged-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 420.00,
      comparePrice: 490.00,
      isFeatured: 1,
      stock: 10,
      specifications: JSON.stringify({
        'Design': 'Origami-Inspired Winged Silhouette with Chevron Paneling',
        'Material': 'Full Grain Pebble Leather Body with Smooth Trim',
        'Handle': 'Hand-Braided Corded Arch Top Handle',
        'Accessories': 'Adjustable Shoulder Strap & Matching Continental Zip Wallet'
      }),
      description: 'A daring, sculptural silhouette that commands attention wherever you go. Precision diagonal chevron leather cuts fold outward into flared wings, finished with an artisan braided handle.',
      deliveryInfo: 'Premium nationwide delivery in protective storage bag.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.17 PM (2).jpeg'
      ]
    },
    {
      name: 'POMBELL Classic Dome Bowling Satchel & Wallet with Crossbody Strap',
      slug: 'pombell-classic-dome-bowling-satchel',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 385.00,
      comparePrice: 450.00,
      isFeatured: 1,
      stock: 16,
      specifications: JSON.stringify({
        'Silhouette': 'Classic Curved Dome Bowling Bag',
        'Hardware': 'Twist Padlock Front Lock and Extended Two-Way Zippers',
        'Included': 'Satchel, Adjustable Long Strap, Full-Length Continental Wallet',
        'Colors': 'Olive Green, Dusty Lavender, Burgundy, Camel Tan, Sky Blue, Noir Black, Espresso Brown'
      }),
      description: 'A silhouette inspired by timeless Parisian luxury travel luggage. Spacious curved dome opens wide for effortless packing, secured by dual heavy-duty zips and a turnlock front accent.',
      deliveryInfo: 'Same day dispatch in Greater Accra.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.18 PM (1).jpeg',
        'WhatsApp Image 2026-09-03 at 12.40.18 PM (2).jpeg'
      ]
    },
    {
      name: 'POMBELL L18010 Asymmetric Wave-Flap Top Handle Handbag & Wallet (29-14-20cm)',
      slug: 'pombell-l18010-asymmetric-flap-handbag',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 375.00,
      comparePrice: 440.00,
      isFeatured: 0,
      stock: 14,
      specifications: JSON.stringify({
        'Dimensions': '29 cm x 14 cm x 20 cm',
        'Model': 'L18010',
        'Cut': 'Dynamic Asymmetric Wave Front Flap with Contrast Binding',
        'Lock': 'Modern Vertical Keyhole Twist Latch',
        'Wallet': 'Matching Snap-Button Continental Leather Wallet'
      }),
      description: 'Break away from symmetry with the striking L18010. Its organic wave flap contours down into a vertical keyhole twist lock, highlighted by contrast edge trim.',
      deliveryInfo: 'Fast delivery across Ghana.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.18 PM.jpeg'
      ]
    },
    {
      name: 'ET Leather Collections Seasonal Showcase Lineup',
      slug: 'et-leather-collections-showcase',
      sellerId: sellerBId,
      categoryId: catMap['bags'],
      price: 380.00,
      comparePrice: 450.00,
      isFeatured: 0,
      stock: 25,
      specifications: JSON.stringify({
        'Collection': 'ET Leather Fashion Bags Verified Accra Inventory',
        'Varieties': 'Quilted Luxury, Top-Handle Satchels, Flap Shoulder Bags, Totes',
        'Origin': 'Guaranteed Genuine ET Leather Fashion Bags Stock'
      }),
      description: 'Explore the full range of authentic ET Leather fashion bags available in Accra. Choose from rich hues in olive green, vibrant yellow, royal purple, burgundy, and classic midnight black.',
      deliveryInfo: 'Immediate pickup in East Legon or courier dispatch nationwide.',
      images: [
        'WhatsApp Image 2026-09-03 at 12.40.17 PM (3).jpeg'
      ]
    }
  ];

  console.log(`Seeding ${productsToSeed.length} real products...`);

  for (const p of productsToSeed) {
    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug) as { id: number } | undefined;
    let productId: number;

    if (!existing) {
      const res = db.prepare(`
        INSERT INTO products (
          seller_id, category_id, name, slug, description, price_ghs, compare_price_ghs,
          stock_quantity, status, is_featured, specifications, delivery_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
      `).run(
        p.sellerId,
        p.categoryId,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.comparePrice || null,
        p.stock,
        p.isFeatured,
        p.specifications,
        p.deliveryInfo
      );
      productId = Number(res.lastInsertRowid);
    } else {
      productId = existing.id;
    }

    // Link images
    let order = 0;
    for (const imgName of p.images) {
      const imgData = imageMap[imgName];
      if (!imgData) continue;

      const existingImg = db.prepare('SELECT id FROM product_images WHERE product_id = ? AND image_url = ?')
        .get(productId, imgData.imageUrl);

      if (!existingImg) {
        db.prepare(`
          INSERT INTO product_images (product_id, image_url, thumbnail_url, alt_text, display_order, is_primary)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          productId,
          imgData.imageUrl,
          imgData.thumbnailUrl,
          p.name,
          order,
          order === 0 ? 1 : 0
        );
      }
      order++;
    }
  }

  // 6. Foundation Impact Initiatives (database-driven)
  const impactInitiatives = [
    {
      name: 'Community Youth Tutoring & Literacy Program',
      slug: 'community-youth-tutoring',
      summary: 'Providing free after-school literacy tutoring, school textbooks, and learning kits to primary school pupils in disadvantaged communities.',
      description: 'Education is the most powerful equalizer. Noléya Foundation\'s literacy initiative partners with trained university tutors to deliver structured reading, writing, and STEM tutoring to children who would otherwise lack supplemental academic support.',
      metricLabel: 'Children Tutored',
      metricValue: '420+ Pupils',
      displayOrder: 1,
      imageUrl: '/uploads/products/img_12.39.43_pm.jpeg'
    },
    {
      name: 'School Shoes & Uniforms Distribution Drive',
      slug: 'school-shoes-uniforms-drive',
      summary: 'Equipping vulnerable primary and junior high school pupils with durable school shoes, bags, and clean uniforms so they can attend school with dignity.',
      description: 'Countless bright students in rural districts face attendance barriers simply because they lack proper footwear or basic school uniforms. Our annual distribution drive directly equips children with locally crafted leather school shoes and uniforms.',
      metricLabel: 'Shoes & Uniforms Distributed',
      metricValue: '850+ Pairs',
      displayOrder: 2,
      imageUrl: '/uploads/products/img_12.40.16_pm_1.jpeg'
    },
    {
      name: 'Emergency Food & Nutrition Relief for Vulnerable Families',
      slug: 'food-nutrition-relief',
      summary: 'Delivering wholesome food staples, iron-fortified tonics, and nutritional packages to elderly citizens and impoverished families.',
      description: 'Noléya Foundation directly addresses food insecurity by delivering monthly staples, cooking essentials, and pediatric nutritional tonics to families facing acute economic distress in urban informal settlements.',
      metricLabel: 'Families Nourished',
      metricValue: '1,200+ Households',
      displayOrder: 3,
      imageUrl: '/uploads/products/img_12.39.43_pm_2.jpeg'
    }
  ];

  for (const item of impactInitiatives) {
    const existing = db.prepare('SELECT id FROM foundation_impact WHERE slug = ?').get(item.slug);
    if (!existing) {
      db.prepare(`
        INSERT INTO foundation_impact (initiative_name, slug, summary, description, image_url, metric_label, metric_value, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(item.name, item.slug, item.summary, item.description, item.imageUrl, item.metricLabel, item.metricValue, item.displayOrder);
    }
  }

  // 7. Site Settings
  const defaultSettings = [
    { key: 'site_title', value: 'Noléya Marketplace | Shop with purpose.' },
    { key: 'foundation_name', value: 'Noléya Foundation' },
    { key: 'foundation_tagline', value: 'Spreading joy. Restoring hope.' },
    { key: 'marketplace_tagline', value: 'Shop with purpose.' },
    { key: 'hero_title', value: 'Discover Local Products. Empower Ghanaian Communities.' },
    { key: 'hero_subtitle', value: 'Discover products from local businesses and independent sellers while supporting meaningful community initiatives through Noléya Foundation.' },
    { key: 'contact_phone_1', value: '0545811197' },
    { key: 'contact_phone_2', value: '0204822847' },
    { key: 'contact_email', value: 'support@noleya.org' },
    { key: 'contact_address', value: 'Accra, Greater Accra Region, Ghana' },
    { key: 'foundation_relationship_text', value: 'Noléya Marketplace creates an opportunity for businesses and entrepreneurs to showcase their products while contributing to the work of Noléya Foundation. Every purchase empowers a local seller while helping fund community outreach, education, and healthcare support for vulnerable Ghanaians.' },
    { key: 'seller_rules_text', value: '1. All products must be genuine, accurately photographed, and fairly priced.\n2. Sellers must fulfill confirmed orders promptly with reliable contact information.\n3. Prohibited, expired, or counterfeit goods will result in immediate permanent suspension.\n4. Sellers commit to honoring the agreed 5% charitable contribution on confirmed marketplace orders to support Noléya Foundation community programs.' }
  ];

  for (const s of defaultSettings) {
    db.prepare(`
      INSERT INTO site_settings (key, value, description)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(s.key, s.value, s.key);
  }

  console.log('--- Noléya Marketplace Database Seeding Complete ---');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
