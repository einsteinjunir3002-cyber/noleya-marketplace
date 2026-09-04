const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { DatabaseSync } = require('node:sqlite');

async function run() {
  console.log('=== Processing New Media for Noléya Marketplace ===');
  
  const mediaDir = path.resolve(process.cwd(), 'Media');
  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', 'products');
  const thumbDir = path.resolve(process.cwd(), 'public', 'uploads', 'products', 'thumbs');
  
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.mkdirSync(thumbDir, { recursive: true });

  const db = new DatabaseSync('./data/noleya.db');

  // Ensure sellers exist
  let seller1 = db.prepare("SELECT id FROM sellers WHERE slug = 'noleya-curated-hampers'").get();
  if (!seller1) {
    db.prepare(`
      INSERT INTO sellers (user_id, business_name, slug, whatsapp_number, phone, email, region, city, address, bio, commission_rate, status, delivery_notes)
      VALUES (1, 'Noléya Curated Hampers & Personalized Gifts', 'noleya-curated-hampers', '0545811197', '0545811197', 'Noléyafoundation@gmail.com', 'Greater Accra', 'Accra', 'Airport Residential, Accra', 'Bespoke corporate gift hampers, personalized keepsakes, and luxury occasion packages connecting impact to joy.', 0.05, 'approved', 'Same-day delivery across Accra & Tema; reliable courier dispatch across all 16 regions of Ghana.')
    `).run();
    seller1 = db.prepare("SELECT id FROM sellers WHERE slug = 'noleya-curated-hampers'").get();
  }

  let seller2 = db.prepare("SELECT id FROM sellers WHERE slug = 'crime-scene-streetwear'").get();
  if (!seller2) {
    db.prepare(`
      INSERT INTO sellers (user_id, business_name, slug, whatsapp_number, phone, email, region, city, address, bio, commission_rate, status, delivery_notes)
      VALUES (1, 'Crime Scene Clothing Line', 'crime-scene-streetwear', '0204822847', '0204822847', 'Noléyafoundation@gmail.com', 'Greater Accra', 'Accra', 'Osu & East Legon, Accra', 'Contemporary Ghanaian conceptual streetwear brand exploring truth, evidence, and raw narrative style.', 0.05, 'approved', 'Fast nationwide delivery via VIP parcel and local rider courier.')
    `).run();
    seller2 = db.prepare("SELECT id FROM sellers WHERE slug = 'crime-scene-streetwear'").get();
  }

  const sellerHamperId = seller1.id;
  const sellerStreetwearId = seller2.id;

  // Process & Deduplicate Media files
  const files = fs.readdirSync(mediaDir);
  const hashes = new Set();
  const processedImages = {};

  for (const file of files) {
    if (!file.match(/\.(jpe?g|png|webp)$/i)) continue;
    const isNew = file.includes('7.24') || file.includes('8.47') || file.includes('8.53');
    if (!isNew) continue;

    const fullPath = path.join(mediaDir, file);
    const buf = fs.readFileSync(fullPath);
    const hash = crypto.createHash('md5').update(buf).digest('hex');

    if (hashes.has(hash)) {
      console.log(`Skipping duplicate image: ${file} (MD5: ${hash})`);
      continue;
    }
    hashes.add(hash);

    const safeName = file
      .replace(/WhatsApp Image 2026-09-03 at /g, 'img_')
      .replace(/\s+/g, '_')
      .replace(/[()]/g, '')
      .toLowerCase();

    const destPath = path.join(uploadDir, safeName);
    const thumbPath = path.join(thumbDir, `thumb_${safeName}`);

    await sharp(fullPath)
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .toFile(destPath);

    await sharp(fullPath)
      .resize(450, 450, { fit: 'cover', position: 'center' })
      .toFile(thumbPath);

    processedImages[file] = {
      imageUrl: `/uploads/products/${safeName}`,
      thumbnailUrl: `/uploads/products/thumbs/thumb_${safeName}`,
    };
    console.log(`Processed: ${file} -> ${safeName}`);
  }

  // Define new products with smart categorization
  const newProducts = [
    {
      name: 'Personalized Bamboo Journal & MenBense Leather Wallet Executive Hamper',
      slug: 'personalized-bamboo-journal-leather-wallet-executive-hamper',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 380,
      compare_price: 450,
      stock: 15,
      is_featured: 1,
      sku: 'GFT-BAMB-WAL-001',
      description: 'A bespoke executive gift hamper crafted for leaders, thinkers, and milestone celebrations. Features an eco-friendly bamboo wood spiral hardcover diary laser-engraved with customized name and inspirational quote, paired with a matching natural bamboo ballpoint stylus pen and a premium MenBense bifold leather wallet, artfully presented on shredded crimson paper in a luxury gift box.',
      specifications: JSON.stringify({
        "Material": "Natural Bamboo Wood & MenBense Faux Leather",
        "Includes": "Personalized Bamboo Journal, Bamboo Stylus Pen, MenBense Bifold Wallet, Luxury Gift Hamper",
        "Customization": "Laser engraved name & personalized quote",
        "Packaging": "Rigid hamper box with red paper shreds",
        "Origin": "Crafted & Assembled in Accra, Ghana"
      }),
      delivery_info: 'Same-day or next-day delivery in Accra & Tema. 24-48 hours delivery across all other regions of Ghana.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.17 PM (1).jpeg',
    },
    {
      name: '"Half His Deen & Half Her Deen" Islamic Couple Mug Set',
      slug: 'half-his-deen-half-her-deen-islamic-couple-mug-set',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 180,
      compare_price: 220,
      stock: 25,
      is_featured: 1,
      sku: 'GFT-MUG-DEEN-002',
      description: 'Celebrate sacred union, Nikkah ceremonies, and anniversaries with this romantic two-piece ceramic mug set. Beautifully printed with intertwined hands illustration, delicate heart motifs, and custom husband & wife name personalization ("Half His Deen" & "Half Her Deen"). Packaged in a display-window peach gift hamper box.',
      specifications: JSON.stringify({
        "Material": "High-grade glazed white ceramic",
        "Capacity": "11oz (325ml) per mug",
        "Set Includes": "2 Matching Mugs (Half His Deen / Half Her Deen)",
        "Care": "Microwave & Dishwasher Safe, Sublimation Print",
        "Packaging": "Window display gift hamper box"
      }),
      delivery_info: 'Carefully bubble-wrapped and dispatched across Ghana.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.17 PM.jpeg',
    },
    {
      name: 'Royal Blue Executive 3-Piece Thermal Flask & Journal Gift Set',
      slug: 'royal-blue-executive-thermal-flask-journal-set',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 320,
      compare_price: 380,
      stock: 20,
      is_featured: 0,
      sku: 'GFT-BLUE-EXEC-003',
      description: 'A stylish corporate and personal gifting curation in striking matte royal blue. Includes a 500ml double-wall vacuum insulated stainless steel water bottle with custom name engraving, a coordinated royal blue faux leather notebook with ribbon bookmark, and a matching royal blue metallic stylus pen.',
      specifications: JSON.stringify({
        "Thermal Flask": "500ml 304 Food-grade Stainless Steel (Keeps hot 12h / cold 24h)",
        "Notebook": "A5 Lined Premium Leatherette Journal",
        "Pen": "Dual-function metal ballpoint & touch stylus",
        "Color": "Royal Blue Matte Finish",
        "Customization": "Laser engraved recipient name on all 3 items"
      }),
      delivery_info: 'Available for immediate dispatch nationwide.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.18 PM (1).jpeg',
    },
    {
      name: "Men's Heritage Waffle Polo & Matelot Fragrance Luxury Hamper",
      slug: 'mens-heritage-waffle-polo-matelot-fragrance-hamper',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 450,
      compare_price: 520,
      stock: 12,
      is_featured: 1,
      sku: 'GFT-MEN-POLO-004',
      description: "An all-in-one men's lifestyle curation featuring a classic cream waffle-knit 100% cotton polo shirt, an exquisite Matelot Eau de Parfum in a nautical striped drawstring pouch, a designer black leather wallet with polished gold bit buckle, and an adjustable woven/leather belt.",
      specifications: JSON.stringify({
        "Polo Shirt": "100% Cotton Textured Waffle Polo (XL relaxed fit)",
        "Fragrance": "Matelot Eau de Parfum with striped keepsake bag",
        "Accessories": "Designer bifold black wallet + matching belt",
        "Packaging": "Heavy kraft gift box with red shredded paper lining"
      }),
      delivery_info: 'Dispatched with care from Accra to all regions.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.18 PM (2).jpeg',
    },
    {
      name: 'Burgundy Textured Polo & Monogrammed Keepsake Gift Box',
      slug: 'burgundy-textured-polo-monogrammed-keepsake-gift-box',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 390,
      compare_price: 460,
      stock: 15,
      is_featured: 0,
      sku: 'GFT-BURG-POLO-005',
      description: 'A rich burgundy themed gift curation featuring a textured breathable knit polo shirt, a personalized glossy ceramic mug with custom name typography, an engraved bamboo & leather keychain, and a designer bifold wallet with snap clasp closure.',
      specifications: JSON.stringify({
        "Polo": "Burgundy textured breathable waffle-knit",
        "Mug": "11oz customized monogram ceramic mug",
        "Keychain": "Bamboo wood & genuine leather key tag",
        "Wallet": "Embossed pattern bifold with snap lock"
      }),
      delivery_info: 'Dispatched via trusted courier nationwide.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.18 PM (3).jpeg',
    },
    {
      name: 'Newborn Baby Welcome & Essential Care Deluxe Hamper',
      slug: 'newborn-baby-welcome-essential-care-deluxe-hamper',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 480,
      compare_price: 550,
      stock: 18,
      is_featured: 1,
      sku: 'GFT-BABY-CARE-006',
      description: 'The ideal welcoming gift for new mothers and newborn babies in Ghana. Packed with doctor-recommended gentle baby essentials including Flora Kids gentle protection diapers, Softcare premium baby diapers, Cussons Baby Soft & Smooth moisturizing lotion, Cussons Baby talc powder, Cussons gentle cleansing bars, and Softcare sensitive baby wipes.',
      specifications: JSON.stringify({
        "Includes": "Flora Kids Diapers, Softcare Diapers, Cussons Baby Lotion, Powder, Soaps, Softcare Wipes",
        "Skin Safety": "Hypoallergenic, dermatologist-tested for delicate newborn skin",
        "Hamper Box": "Rigid white chest hamper with satin lining"
      }),
      delivery_info: 'Safe and hygienic nationwide delivery.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.18 PM (4).jpeg',
    },
    {
      name: "Noir Royale Men's Luxury Timepiece & Oud Fragrance Hamper",
      slug: 'noir-royale-mens-timepiece-oud-fragrance-hamper',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 620,
      compare_price: 750,
      stock: 10,
      is_featured: 1,
      sku: 'GFT-NOIR-OUD-007',
      description: 'An executive statement gift box for discerning gentlemen. Showcases a monochrome vertical ribbed knit polo with gold accent lapel pin, Efolia Oud de Parfum Extreme (luxury Arabian oud fragrance), and a 3-piece stainless steel ensemble including a fluted bezel dress watch, an engraved bar link bracelet ("SKY"), and a tag pendant necklace.',
      specifications: JSON.stringify({
        "Watch": "Fluted bezel stainless steel dress watch with date window",
        "Jewelry": "Engraved bar link bracelet + matching dog-tag chain necklace",
        "Fragrance": "Efolia Oud de Parfum Extreme (100ml)",
        "Polo": "Black & white ribbed vertical stripe knit polo",
        "Extras": "Gold lapel pin & greeting card"
      }),
      delivery_info: 'Express courier delivery across Ghana.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.18 PM.jpeg',
    },
    {
      name: "Lavender Romance Luxury Women's Celebration Hamper",
      slug: 'lavender-romance-luxury-womens-celebration-hamper',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 580,
      compare_price: 680,
      stock: 12,
      is_featured: 1,
      sku: 'GFT-LAV-WOM-008',
      description: "An enchanting celebration hamper designed for birthdays, Mother's Day, and bridal milestones. Contains a chic pastel lilac crossbody bag with cultured pearl handle, a chilled bottle of Zomba Pink sparkling wine, an 18K gold-plated pendant necklace and stud earrings set, an electric ceramic mug warmer set (\"Lucky\"), a portable rechargeable cooling fan, a lavender plush hand towel, and gourmet confections.",
      specifications: JSON.stringify({
        "Handbag": "Pastel lilac vegan leather purse with pearl handle & crossbody strap",
        "Sparkling Beverage": "Zomba Pink Sparkling Wine (750ml)",
        "Jewelry": "18K Gold-plated triangular heart pendant & matching earrings",
        "Tech & Comfort": "Electric mug warmer coaster + USB mini cooling fan + plush towel"
      }),
      delivery_info: 'Delivered securely in festive gift packaging.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.19 PM (1).jpeg',
    },
    {
      name: 'Royal Crown Custom Engraved 4-Piece Timepiece & Jewelry Suite',
      slug: 'royal-crown-custom-engraved-4piece-timepiece-jewelry-suite',
      category_id: 6, // Jewellery & Watches
      seller_id: sellerHamperId,
      price: 490,
      compare_price: 580,
      stock: 15,
      is_featured: 1,
      sku: 'JWL-ROYAL-CROWN-009',
      description: 'A stunning personal statement suite in polished stainless steel. Features a luxury dress watch with diamond hour markers and custom dial crown engraving ("Kafui 👑"), paired with a matching engraved bar link bracelet, an engraved tag necklace, and an engraved comfort-fit band ring, presented in a red velvet jewelry box.',
      specifications: JSON.stringify({
        "Watch Movement": "High precision quartz with date magnification cyclops",
        "Material": "Solid 316L Stainless Steel, tarnish-free & hypoallergenic",
        "Set Includes": "Watch + Bar Link Bracelet + Pendant Necklace + Band Ring",
        "Personalization": "Custom name & royal crown laser engraving",
        "Box": "Luxe crimson velvet lined jewelry case"
      }),
      delivery_info: 'Nationwide registered delivery across Ghana.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.19 PM (2).jpeg',
    },
    {
      name: '"The Boss" Executive Wooden Desk Stand & Leather Portfolio Set',
      slug: 'the-boss-executive-wooden-desk-stand-leather-portfolio-set',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 420,
      compare_price: 500,
      stock: 14,
      is_featured: 0,
      sku: 'GFT-BOSS-DESK-010',
      description: 'Crafted for executives, pastors, entrepreneurs, and mentors. Includes a handcrafted solid pine desk organizer with smartphone / business card display stand laser-engraved with an inspirational scripture ("THE BOSS - May You Always Be Blessed, Philippians 4:19"), accompanied by an executive slate blue leather binder portfolio with magnetic clasp, a custom engraved metal pen, and an engraved wooden keychain.',
      specifications: JSON.stringify({
        "Desk Organizer": "Natural solid wood pen holder & smartphone dock",
        "Portfolio": "A5 Slate Blue Faux Leather Binder with magnetic buckle",
        "Engraving": "Custom name and scripture dedication",
        "Includes": "Desk Dock, A5 Binder, Ballpoint Pen, Wooden Keychain, Hamper Box"
      }),
      delivery_info: 'Same-day delivery in Accra. 24-48h nationwide.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.19 PM (3).jpeg',
    },
    {
      name: 'Blush Pink & Royal Blue Birthday Pamper Gift Box',
      slug: 'blush-pink-royal-blue-birthday-pamper-gift-box',
      category_id: 9, // Gifts & Hampers
      seller_id: sellerHamperId,
      price: 520,
      compare_price: 620,
      stock: 12,
      is_featured: 0,
      sku: 'GFT-PINK-BLUE-011',
      description: 'A vibrant celebration hamper featuring a dusty rose designer flap purse with gold monogram hardware, a 750ml bottle of Mega Non-Alcoholic Red Grape Sparkling Wine, a sparkling heart crystal tennis bracelet in gift box, Pink Love fragrance mist duo, blush pink slide sandals, and a 3-piece royal blue cotton towel set with satin ribbons.',
      specifications: JSON.stringify({
        "Items Included": "Designer Handbag, Mega Non-Alcoholic Red Grape, Heart Tennis Bracelet, Slide Sandals, Towel Set, Perfume Set",
        "Packaging": "Premium large rigid gift chest"
      }),
      delivery_info: 'Delivered securely in festive gift packaging.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.19 PM.jpeg',
    },
    {
      name: 'Bespoke Photo & Brand Custom Printed Shockproof Phone Cases',
      slug: 'bespoke-photo-brand-custom-printed-shockproof-phone-cases',
      category_id: 7, // Electronics
      seller_id: sellerHamperId,
      price: 95,
      compare_price: 130,
      stock: 50,
      is_featured: 0,
      sku: 'ELE-PHONE-CUSTOM-012',
      description: 'Transform your favorite memories, family portraits, artistic photography, or business logos into durable shockproof phone cases. Available for all iPhone models (iPhone 11 through iPhone 16 Pro Max) and Samsung Galaxy series. High-definition anti-scratch UV sublimation printing ensures vibrant, fade-proof colors with reinforced corner bumpers.',
      specifications: JSON.stringify({
        "Compatibility": "iPhone 11 - 16 Pro Max, Samsung Galaxy S & A Series",
        "Print Quality": "HD UV Sublimation, Fade & Scratch Resistant",
        "Protection": "Reinforced drop-proof TPU bumper with raised camera bezel"
      }),
      delivery_info: 'Custom printed and dispatched within 24-48 hours.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 7.24.20 PM.jpeg',
    },
    {
      name: 'Crime Scene "Evidence Never Lies" Washed Black Oversized Graphic Tee',
      slug: 'crime-scene-evidence-never-lies-washed-black-oversized-tee',
      category_id: 4, // Fashion
      seller_id: sellerStreetwearId,
      price: 220,
      compare_price: 260,
      stock: 30,
      is_featured: 1,
      sku: 'CS-TEE-BLK-013',
      description: 'The signature heavyweight streetwear graphic tee from Crime Scene Clothing Line\'s Case 001: "Truth in Silence" collection. Cut from 240 GSM pre-shrunk washed black cotton in an oversized streetwear silhouette. Features yellow crime scene tape and forensic chalk evidence markers on the back, and a minimalist chest print on the front.',
      specifications: JSON.stringify({
        "Fabric": "100% Heavyweight Cotton (240 GSM)",
        "Color": "Forensic Washed Black",
        "Fit": "Relaxed / Oversized Streetwear Fit",
        "Front Print": "Crime Scene Est. 2024 (Evidence Yellow)",
        "Back Print": "Evidence Never Lies — Forensic Investigation Chalk Artwork",
        "Origin": "Designed & Made in Ghana"
      }),
      delivery_info: 'Nationwide dispatch via rider and VIP parcel service.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.03 PM.jpeg',
      secondaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.01 PM.jpeg',
    },
    {
      name: 'Crime Scene "Evidence Never Lies" Sand Beige Oversized Graphic Tee',
      slug: 'crime-scene-evidence-never-lies-sand-beige-oversized-tee',
      category_id: 4, // Fashion
      seller_id: sellerStreetwearId,
      price: 220,
      compare_price: 260,
      stock: 25,
      is_featured: 1,
      sku: 'CS-TEE-BGE-014',
      description: 'Crafted in an earthy sand beige hue, this 240 GSM heavyweight oversized tee embodies the forensic investigative narrative: "Behind the tape lies more than just a scene. It holds the truth, the facts, and the justice that follows." Finished with distressed evidence graphic and crime scene tape back piece.',
      specifications: JSON.stringify({
        "Fabric": "100% Combed Cotton (240 GSM)",
        "Color": "Sand Beige / Desert Stone",
        "Fit": "Oversized Streetwear Silhouette",
        "Print": "Screen printed with distressed texture",
        "Origin": "Accra, Ghana"
      }),
      delivery_info: 'Nationwide delivery across Ghana.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.03 PM (2).jpeg',
    },
    {
      name: 'Crime Scene "Truth Is Silent" Pure White Minimalist Streetwear Tee',
      slug: 'crime-scene-truth-is-silent-pure-white-minimalist-tee',
      category_id: 4, // Fashion
      seller_id: sellerStreetwearId,
      price: 210,
      compare_price: 250,
      stock: 25,
      is_featured: 1,
      sku: 'CS-TEE-WHT-015',
      description: 'Clean, striking, and understated. Pure white heavyweight cotton tee featuring minimal "CRIME SCENE - EST 2026" chest typography, paired with a custom lower hem evidence case file patch with barcode detailing. Tagline: "For those who move in silence, but notice everything."',
      specifications: JSON.stringify({
        "Fabric": "100% Ringspun Cotton (240 GSM)",
        "Color": "Pure Optical White",
        "Details": "Woven case file patch on lower hem, ribbed crewneck",
        "Fit": "Modern boxy relaxed fit"
      }),
      delivery_info: 'Dispatched directly from Accra.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.53.11 PM (1).jpeg',
    },
    {
      name: 'Crime Scene "Observe. Record. Reveal." Washed Black Long-Sleeve Shirt',
      slug: 'crime-scene-observe-record-reveal-washed-black-long-sleeve',
      category_id: 4, // Fashion
      seller_id: sellerStreetwearId,
      price: 260,
      compare_price: 310,
      stock: 20,
      is_featured: 0,
      sku: 'CS-LS-BLK-016',
      description: 'Streetwear long-sleeve tee from the Evidence Collection. Crafted from soft-washed 240 GSM black cotton featuring distressed yellow typography down both sleeves ("OBSERVE. RECORD. REVEAL." on left sleeve, "SILENT SCENE. LOUD TRUTH." on right sleeve) and a full investigative evidence back print.',
      specifications: JSON.stringify({
        "Fabric": "100% Washed Cotton (240 GSM)",
        "Sleeves": "Dual statement typography prints with ribbed wrist cuffs",
        "Back Graphic": "Crime Scene Do Not Cross — Not Every Clue Is Obvious"
      }),
      delivery_info: 'Available for immediate dispatch nationwide.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.02 PM (2).jpeg',
    },
    {
      name: 'Crime Scene "Follow The Evidence" Heavyweight Graphic Streetwear Hoodie',
      slug: 'crime-scene-follow-the-evidence-heavyweight-graphic-hoodie',
      category_id: 4, // Fashion
      seller_id: sellerStreetwearId,
      price: 380,
      compare_price: 450,
      stock: 18,
      is_featured: 1,
      sku: 'CS-HDY-017',
      description: 'Premium heavyweight fleece hoodie designed for cool harmattan nights and effortless urban styling. Features a double-layer drawstring hood, kangaroo front pocket, bold yellow chest logo, yellow sleeve typography, and large "CRIME SCENE DO NOT CROSS - FOLLOW THE EVIDENCE, NOT OPINIONS" artwork across the back. Available in Ash Grey and Forensic Black.',
      specifications: JSON.stringify({
        "Fabric": "380 GSM Cotton-Poly Heavyweight Brushed Fleece",
        "Features": "Double-lined hood with metal aglets, kangaroo pocket",
        "Prints": "High-density chest, sleeve, and full-back graphics"
      }),
      delivery_info: 'Carefully packaged and dispatched nationwide.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.04 PM.jpeg',
    },
    {
      name: 'Crime Scene "Evidence Collection" Women\'s Cropped Rib Tank Top',
      slug: 'crime-scene-evidence-collection-womens-cropped-rib-tank-top',
      category_id: 4, // Fashion
      seller_id: sellerStreetwearId,
      price: 160,
      compare_price: 190,
      stock: 22,
      is_featured: 0,
      sku: 'CS-TNK-WOM-018',
      description: 'Edgy streetwear cropped tank top made from 220 GSM 2-way stretch rib-knit cotton. Features the iconic distressed crime scene evidence graphic on the front, minimal upper back branding, and a flattering body-contouring cropped cut.',
      specifications: JSON.stringify({
        "Fabric": "220 GSM 2-Way Stretch Premium Ribbed Cotton",
        "Fit": "Cropped Athletic / Streetwear Fit",
        "Color": "Bone White / Ash",
        "Print": "Front evidence marker composition with distressed caution tape"
      }),
      delivery_info: 'Available for immediate delivery across Ghana.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.03 PM (1).jpeg',
    },
    {
      name: 'Crime Scene "Follow The Evidence" Raw-Cut Sleeveless Muscle Streetwear Tee',
      slug: 'crime-scene-follow-the-evidence-raw-cut-sleeveless-muscle-tee',
      category_id: 4, // Fashion
      seller_id: sellerStreetwearId,
      price: 190,
      compare_price: 230,
      stock: 20,
      is_featured: 0,
      sku: 'CS-MSL-RAW-019',
      description: 'High-impact sleeveless streetwear muscle tee featuring raw-cut open armholes, a relaxed oversized body, and the "Follow The Evidence, Not Opinions" forensic evidence front statement artwork. Perfect for gym sessions, concerts, and casual street culture.',
      specifications: JSON.stringify({
        "Fabric": "240 GSM Heavyweight Cotton",
        "Cut": "Raw-cut armhole edges with reinforced shoulder seams",
        "Fit": "Boxy Oversized Streetwear Muscle Tee"
      }),
      delivery_info: 'Nationwide dispatch via rider and VIP parcel service.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.03 PM (3).jpeg',
    },
    {
      name: '"Evidence Never Lies" Case No. 04272025 Collector\'s Art Print Poster',
      slug: 'evidence-never-lies-case-no-04272025-collectors-art-print-poster',
      category_id: 8, // Home & Lifestyle
      seller_id: sellerStreetwearId,
      price: 120,
      compare_price: 150,
      stock: 30,
      is_featured: 0,
      sku: 'ART-PST-EVID-020',
      description: 'A limited-edition investigative conceptual art poster for creative spaces, studios, and modern home decor. Features a dramatic photographic capture of evidence markers, broken glass, yellow caution tape, forensic tweezers, fingerprint stamp, and barcode metadata.',
      specifications: JSON.stringify({
        "Paper": "300 GSM Heavyweight Matte Archival Cardstock",
        "Size": "A2 (420 x 594 mm)",
        "Print Type": "High-Definition Offset Litho Print",
        "Packaging": "Rolled in protective heavy-duty postal tube"
      }),
      delivery_info: 'Safely packed in rigid tube to prevent creasing.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.02 PM.jpeg',
    },
    {
      name: 'Crime Scene Clothing Line — Complete SS26 Capsule Collection Lookbook',
      slug: 'crime-scene-clothing-line-complete-ss26-capsule-collection',
      category_id: 4, // Fashion
      seller_id: sellerStreetwearId,
      price: 980,
      compare_price: 1200,
      stock: 8,
      is_featured: 1,
      sku: 'CS-BNDL-SS26-021',
      description: 'Complete multi-piece bundle from Crime Scene Clothing Line\'s SS26 "Truth in Silence" debut. Includes 1 Washed Black Graphic Tee, 1 Sand Beige Oversized Tee, 1 Long-Sleeve Streetwear Shirt, and 1 Heavyweight Fleece Hoodie. A complete streetwear wardrobe curation representing authenticity, evidence, and Ghanaian urban fashion.',
      specifications: JSON.stringify({
        "Bundle Includes": "1x Washed Black Tee, 1x Sand Beige Tee, 1x Long-Sleeve Shirt, 1x Heavyweight Fleece Hoodie",
        "Sizes Available": "S, M, L, XL, XXL (Customizable per item)",
        "Packaging": "Limited edition evidence bag collector\'s box"
      }),
      delivery_info: 'Premium VIP boxed delivery across Ghana.',
      primaryImageFile: 'WhatsApp Image 2026-09-03 at 8.47.02 PM (1).jpeg',
    }
  ];

  // Insert into SQLite database
  console.log(`Inserting ${newProducts.length} new products into database...`);

  for (const prod of newProducts) {
    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(prod.slug);
    let productId;

    if (existing) {
      productId = existing.id;
      db.prepare(`
        UPDATE products 
        SET name = ?, category_id = ?, seller_id = ?, description = ?, price_ghs = ?, compare_price_ghs = ?, stock_quantity = ?, is_featured = ?, sku = ?, specifications = ?, delivery_info = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(
        prod.name, prod.category_id, prod.seller_id, prod.description, prod.price, prod.compare_price, prod.stock, prod.is_featured, prod.sku, prod.specifications, prod.delivery_info, productId
      );
      console.log(`Updated product: ${prod.name} (ID: ${productId})`);
    } else {
      const res = db.prepare(`
        INSERT INTO products (name, slug, category_id, seller_id, description, price_ghs, compare_price_ghs, stock_quantity, is_unlimited_stock, status, is_featured, sku, specifications, delivery_info, views_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'published', ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
      `).run(
        prod.name, prod.slug, prod.category_id, prod.seller_id, prod.description, prod.price, prod.compare_price, prod.stock, prod.is_featured, prod.sku, prod.specifications, prod.delivery_info
      );
      productId = Number(res.lastInsertRowid);
      console.log(`Inserted product: ${prod.name} (ID: ${productId})`);
    }

    // Insert Product Images
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);

    const primaryImgData = processedImages[prod.primaryImageFile];
    if (primaryImgData) {
      db.prepare(`
        INSERT INTO product_images (product_id, image_url, thumbnail_url, alt_text, display_order, is_primary, created_at)
        VALUES (?, ?, ?, ?, 1, 1, datetime('now'))
      `).run(productId, primaryImgData.imageUrl, primaryImgData.thumbnailUrl, prod.name);
    }

    if (prod.secondaryImageFile) {
      const secondaryImgData = processedImages[prod.secondaryImageFile];
      if (secondaryImgData) {
        db.prepare(`
          INSERT INTO product_images (product_id, image_url, thumbnail_url, alt_text, display_order, is_primary, created_at)
          VALUES (?, ?, ?, ?, 2, 0, datetime('now'))
        `).run(productId, secondaryImgData.imageUrl, secondaryImgData.thumbnailUrl, `${prod.name} - Detailed Specification & Tech Pack`);
      }
    }
  }

  const totalProducts = db.prepare('SELECT count(*) as count FROM products').get().count;
  console.log(`=== Complete! Total products now in database: ${totalProducts} ===`);
}

run().catch(console.error);
