-- ============================================================================
-- MIGRATION 015: Complete Shopping & Partner Shops Seed Data
-- ============================================================================

-- ============================================================================
-- PARTNER SHOPS (6 realistic Manali shops)
-- ============================================================================

INSERT INTO partner_shops (shop_name, brand_name, category, owner_name, address, distance_from_hotel, opening_hours, phone_number, description, images)
SELECT * FROM (VALUES
  (
    'Himalayan Woolens',
    'Himalayan Woolens',
    'Woollen Items',
    'Ramesh Thakur',
    'Mall Road, Near HDFC Bank, Manali, HP 175131',
    1.20,
    '10:00 AM – 9:00 PM',
    '+91-9418001234',
    'Manali''s most trusted destination for premium hand-woven Pashmina shawls, Kullu-style woollens, and authentic Himachali handicrafts. Family-run for over 30 years.',
    '[]'::jsonb
  ),
  (
    'The Kullu Craft House',
    'Kullu Craft House',
    'Handicrafts',
    'Sunita Devi',
    'Old Manali Road, Near Manu Temple, Manali, HP 175131',
    3.00,
    '9:00 AM – 8:00 PM',
    '+91-9459005678',
    'Authentic Kullu-Manali handicrafts including hand-carved wooden artefacts, silver jewellery, and traditional Thanka paintings. Government-certified artisan cooperative.',
    '[]'::jsonb
  ),
  (
    'Manali Adventure Gear',
    'MAG Outdoors',
    'Adventure Gear',
    'Vikram Singh',
    'Hadimba Road, Near Solang Taxi Stand, Manali, HP 175131',
    2.50,
    '8:00 AM – 7:00 PM',
    '+91-9418009999',
    'Complete adventure and camping equipment rental & retail. Ski gear, trekking poles, sleeping bags, snow boots, and all outdoor essentials at competitive prices.',
    '[]'::jsonb
  ),
  (
    'Valley Dry Fruits & Spices',
    'Valley Fresh',
    'Dry Fruits',
    'Mohd. Iqbal',
    'Mall Road, Near Bus Stand, Manali, HP 175131',
    1.00,
    '9:00 AM – 9:00 PM',
    '+91-9459011122',
    'Premium quality dry fruits, saffron, Kinnauri apples, and local Himachali spices sourced directly from farmers. No middlemen — guaranteed freshness and quality.',
    '[]'::jsonb
  ),
  (
    'Snowflake Souvenirs',
    'Snowflake',
    'Souvenirs',
    'Deepak Sharma',
    'Model Town, Near Hidimba Temple Road, Manali, HP 175131',
    2.80,
    '10:00 AM – 10:00 PM',
    '+91-9816055500',
    'A wide collection of Manali-themed souvenirs, fridge magnets, hand-painted ceramic mugs, miniature temples, and gift-ready Himachali art pieces at very reasonable prices.',
    '[]'::jsonb
  ),
  (
    'Beas River Boutique',
    'Beas Boutique',
    'Local Products',
    'Kavita Negi',
    'Circuit House Road, Near Beas River, Manali, HP 175131',
    0.80,
    '11:00 AM – 8:00 PM',
    '+91-9418077890',
    'Curated collection of locally-produced organic preserves, Himachali wine, apple cider, handmade soaps and candles, and aromatic essential oils from mountain herbs.',
    '[]'::jsonb
  )
) AS v(shop_name, brand_name, category, owner_name, address, distance_from_hotel, opening_hours, phone_number, description, images)
WHERE NOT EXISTS (
  SELECT 1 FROM partner_shops WHERE shop_name = v.shop_name AND deleted_at IS NULL
);

-- ============================================================================
-- PARTNER OFFERS (8 active offers linked to the shops above)
-- All expiry dates set to 2027-12-31 to ensure they remain active
-- ============================================================================

-- Offer 1: Himalayan Woolens — 15% OFF
INSERT INTO partner_offers (shop_id, title, description, offer_type, discount_value, expiry_date, terms, max_redemptions, current_redemptions)
SELECT 
  s.id,
  '15% OFF on All Woolens',
  'Exclusive hotel guest discount! Get 15% off on all hand-woven Pashmina shawls and Kullu woollens when you show your hotel ID card.',
  'Percentage Discount',
  15.00,
  '2027-12-31 23:59:59+05:30',
  'Valid for hotel guests only. Cannot be combined with other offers. Minimum purchase ₹500.',
  200,
  0
FROM partner_shops s
WHERE s.shop_name = 'Himalayan Woolens' AND s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM partner_offers o WHERE o.shop_id = s.id AND o.title = '15% OFF on All Woolens' AND o.deleted_at IS NULL);

-- Offer 2: Himalayan Woolens — Free Gift
INSERT INTO partner_offers (shop_id, title, description, offer_type, discount_value, expiry_date, terms, max_redemptions, current_redemptions)
SELECT 
  s.id,
  'Free Himachali Scarf with Purchase',
  'Spend ₹2000 or more on Pashmina or woollens and receive a complimentary traditional Himachali scarf — worth ₹350 — absolutely free!',
  'Free Gift',
  0.00,
  '2027-12-31 23:59:59+05:30',
  'Valid for hotel guests only. Minimum spend ₹2000. Subject to availability.',
  100,
  0
FROM partner_shops s
WHERE s.shop_name = 'Himalayan Woolens' AND s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM partner_offers o WHERE o.shop_id = s.id AND o.title = 'Free Himachali Scarf with Purchase' AND o.deleted_at IS NULL);

-- Offer 3: Kullu Craft House — 10% OFF
INSERT INTO partner_offers (shop_id, title, description, offer_type, discount_value, expiry_date, terms, max_redemptions, current_redemptions)
SELECT 
  s.id,
  '10% OFF on Handicrafts',
  'Explore our collection of authentic Kullu-Manali handicrafts and enjoy a special 10% discount exclusively for guests of our hotel.',
  'Percentage Discount',
  10.00,
  '2027-12-31 23:59:59+05:30',
  'Valid for hotel guests only. Show hotel room card at billing.',
  150,
  0
FROM partner_shops s
WHERE s.shop_name = 'The Kullu Craft House' AND s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM partner_offers o WHERE o.shop_id = s.id AND o.title = '10% OFF on Handicrafts' AND o.deleted_at IS NULL);

-- Offer 4: Manali Adventure Gear — 20% OFF Rental
INSERT INTO partner_offers (shop_id, title, description, offer_type, discount_value, expiry_date, terms, max_redemptions, current_redemptions)
SELECT 
  s.id,
  '20% OFF on All Gear Rentals',
  'Planning a trek or skiing trip? Rent complete adventure gear including ski sets, trekking poles, jackets, and boots at a flat 20% discount for hotel guests.',
  'Percentage Discount',
  20.00,
  '2027-12-31 23:59:59+05:30',
  'Valid for hotel guests only. Discount applies to rental charges only, not purchases. Valid ID required.',
  300,
  0
FROM partner_shops s
WHERE s.shop_name = 'Manali Adventure Gear' AND s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM partner_offers o WHERE o.shop_id = s.id AND o.title = '20% OFF on All Gear Rentals' AND o.deleted_at IS NULL);

-- Offer 5: Valley Dry Fruits — Flat ₹200 OFF
INSERT INTO partner_offers (shop_id, title, description, offer_type, discount_value, expiry_date, terms, max_redemptions, current_redemptions)
SELECT 
  s.id,
  'Flat ₹200 OFF on Premium Dry Fruits',
  'Take home the finest Himalayan dry fruits, saffron, and spices. Hotel guests enjoy a flat ₹200 off on any purchase of ₹1000 or more.',
  'Flat Discount',
  200.00,
  '2027-12-31 23:59:59+05:30',
  'Valid on minimum purchase of ₹1000. Cannot be combined with other discounts.',
  250,
  0
FROM partner_shops s
WHERE s.shop_name = 'Valley Dry Fruits & Spices' AND s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM partner_offers o WHERE o.shop_id = s.id AND o.title = 'Flat ₹200 OFF on Premium Dry Fruits' AND o.deleted_at IS NULL);

-- Offer 6: Snowflake Souvenirs — Buy 2 Get 1 Free
INSERT INTO partner_offers (shop_id, title, description, offer_type, discount_value, expiry_date, terms, max_redemptions, current_redemptions)
SELECT 
  s.id,
  'Buy 2 Get 1 Free on Souvenirs',
  'Stock up on beautiful Manali memories! Purchase any two souvenir items and get the third one absolutely free. The perfect deal for gifting.',
  'Buy X Get Y',
  0.00,
  '2027-12-31 23:59:59+05:30',
  'Free item will be of equal or lesser value. Valid for hotel guests. One offer per transaction.',
  200,
  0
FROM partner_shops s
WHERE s.shop_name = 'Snowflake Souvenirs' AND s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM partner_offers o WHERE o.shop_id = s.id AND o.title = 'Buy 2 Get 1 Free on Souvenirs' AND o.deleted_at IS NULL);

-- Offer 7: Beas River Boutique — 12% OFF Local Products
INSERT INTO partner_offers (shop_id, title, description, offer_type, discount_value, expiry_date, terms, max_redemptions, current_redemptions)
SELECT 
  s.id,
  '12% OFF on Local Produce & Artisan Goods',
  'Discover handcrafted soaps, organic preserves, Himachali wine, and mountain herb oils. Hotel guests enjoy 12% off on all locally-produced items.',
  'Percentage Discount',
  12.00,
  '2027-12-31 23:59:59+05:30',
  'Valid for hotel guests only. Alcohol purchases subject to local laws.',
  180,
  0
FROM partner_shops s
WHERE s.shop_name = 'Beas River Boutique' AND s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM partner_offers o WHERE o.shop_id = s.id AND o.title = '12% OFF on Local Produce & Artisan Goods' AND o.deleted_at IS NULL);

-- Offer 8: Manali Adventure Gear — Winter Special
INSERT INTO partner_offers (shop_id, title, description, offer_type, discount_value, expiry_date, terms, max_redemptions, current_redemptions)
SELECT 
  s.id,
  'Winter Special: Complete Ski Package',
  'Get a complete ski package deal including skis, poles, boots, helmet, and jacket rental at a flat ₹500 off the standard price — exclusively for hotel guests this winter season.',
  'Flat Discount',
  500.00,
  '2027-12-31 23:59:59+05:30',
  'Valid for hotel guests only. Package must be rented as a complete set. Subject to availability.',
  100,
  0
FROM partner_shops s
WHERE s.shop_name = 'Manali Adventure Gear' AND s.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM partner_offers o WHERE o.shop_id = s.id AND o.title = 'Winter Special: Complete Ski Package' AND o.deleted_at IS NULL);
