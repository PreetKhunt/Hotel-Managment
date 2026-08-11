-- ============================================================================
-- MIGRATION 014: Seed Explore Manali Data
-- ============================================================================

-- 1. MANALI PLACES
INSERT INTO manali_places (name, category, description, distance_from_hotel, approximate_travel_time, opening_time, closing_time, entry_fee, family_friendly, is_free_entry, image)
SELECT * FROM (VALUES
  ('Solang Valley', 'Nature & Adventure', 'A stunning valley known for its summer and winter sports conditions. Offers breathtaking views of glaciers and snow-capped mountains.', 14.00, '40 mins', '09:00:00'::TIME, '18:00:00'::TIME, 0.00, true, true, 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&q=80&w=800'),
  ('Rohtang Pass', 'Nature & Sightseeing', 'A high mountain pass on the eastern Pir Panjal Range of the Himalayas around 51 km from Manali. Famous for its scenic beauty.', 51.00, '2 hours', '06:00:00'::TIME, '17:00:00'::TIME, 500.00, true, false, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800'),
  ('Hidimba Devi Temple', 'Culture & Heritage', 'An ancient cave temple dedicated to Hidimbi Devi, wife of Bhima. Surrounded by a beautiful cedar forest.', 2.50, '10 mins', '08:00:00'::TIME, '18:00:00'::TIME, 0.00, true, true, 'https://images.unsplash.com/photo-1593693397690-362cb9666c6b?auto=format&fit=crop&q=80&w=800'),
  ('Mall Road', 'Shopping & Dining', 'The main street in Manali, lined with multiple hotels, restaurants, and local shops selling woolens and souvenirs.', 1.00, '5 mins', '10:00:00'::TIME, '21:00:00'::TIME, 0.00, true, true, 'https://images.unsplash.com/photo-1596895111956-bf5705a563f4?auto=format&fit=crop&q=80&w=800'),
  ('Old Manali', 'Culture & Dining', 'Known for its quiet settlement, apple orchards, and old guesthouses. It has a distinctive bohemian vibe with numerous cafes.', 3.00, '15 mins', '09:00:00'::TIME, '22:00:00'::TIME, 0.00, true, true, 'https://images.unsplash.com/photo-1518296765103-68d712ce52c0?auto=format&fit=crop&q=80&w=800'),
  ('Jogini Waterfall', 'Nature & Trekking', 'A beautiful waterfall situated near Vashisht Village. The trek to the waterfall is scenic and takes you through pine trees and orchards.', 4.50, '25 mins', '06:00:00'::TIME, '18:00:00'::TIME, 0.00, true, true, 'https://images.unsplash.com/photo-1533090481728-8b598b982181?auto=format&fit=crop&q=80&w=800'),
  ('Vashisht Temple', 'Culture & Heritage', 'Famous for its natural hot water springs and ancient temples dedicated to sage Vashisht and Lord Rama.', 3.50, '15 mins', '07:00:00'::TIME, '21:00:00'::TIME, 0.00, true, true, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800'),
  ('Manu Temple', 'Culture & Heritage', 'A magnificent temple dedicated to the sage Manu, who is said to be the creator of the world and the writer of Manusmriti.', 3.50, '15 mins', '06:00:00'::TIME, '17:00:00'::TIME, 0.00, true, true, 'https://images.unsplash.com/photo-1593693397690-362cb9666c6b?auto=format&fit=crop&q=80&w=800')
) AS v(name, category, description, distance_from_hotel, approximate_travel_time, opening_time, closing_time, entry_fee, family_friendly, is_free_entry, image)
WHERE NOT EXISTS (
  SELECT 1 FROM manali_places WHERE name = v.name
);

-- 2. MANALI ACTIVITIES
INSERT INTO manali_activities (name, category, description, difficulty, approximate_cost, duration, distance_from_hotel, suitable_for, season, image)
SELECT * FROM (VALUES
  ('Paragliding', 'Adventure', 'Experience the thrill of flying like a bird over the scenic valleys of Manali.', 'Moderate', 2500.00, '15-20 mins', 14.00, 'Adults, Teens', 'Summer, Spring, Autumn', 'https://images.unsplash.com/photo-1528650630737-0248443e098a?auto=format&fit=crop&q=80&w=800'),
  ('River Rafting', 'Water Sports', 'Navigate the thrilling rapids of the Beas River. Suitable for both beginners and experienced rafters.', 'Moderate', 1500.00, '1.5 hours', 10.00, 'Adults, Families', 'Summer, Autumn', 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&q=80&w=800'),
  ('Skiing', 'Winter Sports', 'Glide down the snowy slopes of Solang Valley or Rohtang Pass.', 'Hard', 3000.00, '2-4 hours', 14.00, 'Adults, Teens', 'Winter', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=800'),
  ('Snow Activities', 'Winter Sports', 'Enjoy snow scooter rides, tube rides, and building snowmen with family.', 'Easy', 1000.00, '1-2 hours', 14.00, 'Everyone', 'Winter', 'https://images.unsplash.com/photo-1518775053278-5a569f0be353?auto=format&fit=crop&q=80&w=800'),
  ('Trekking', 'Adventure', 'Explore the hidden trails, lush green forests, and majestic mountains surrounding Manali.', 'Moderate to Hard', 0.00, '4-8 hours', 5.00, 'Fitness Enthusiasts', 'Summer, Spring, Autumn', 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800'),
  ('River Crossing', 'Adventure', 'Cross the fast-flowing Beas River while hanging from a rope. An exciting activity for thrill-seekers.', 'Moderate', 500.00, '30 mins', 6.00, 'Adults, Teens', 'Summer, Spring', 'https://images.unsplash.com/photo-1533090481728-8b598b982181?auto=format&fit=crop&q=80&w=800')
) AS v(name, category, description, difficulty, approximate_cost, duration, distance_from_hotel, suitable_for, season, image)
WHERE NOT EXISTS (
  SELECT 1 FROM manali_activities WHERE name = v.name
);

-- 3. MANALI FOOD RECOMMENDATIONS
INSERT INTO manali_food_recommendations (name, description, recommended_restaurant, distance_from_hotel, approximate_cost, veg_non_veg, category, image)
SELECT * FROM (VALUES
  ('Siddu', 'A traditional Himachali steamed bread made from wheat flour and stuffed with local fillings like walnut, poppy seeds, or mutton.', 'Himachali Rasoi', 1.50, 200.00, 'Veg', 'Local Delicacy', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800'),
  ('Babru', 'A popular local snack similar to North Indian Kachoris but made with black gram paste stuffed in the dough.', 'Mall Road Street Stalls', 1.00, 100.00, 'Veg', 'Snack', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800'),
  ('Trout Fish', 'Freshly caught river trout marinated with subtle local spices and pan-fried or grilled to perfection.', 'Johnson''s Cafe', 2.00, 800.00, 'Non-Veg', 'Main Course', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=800'),
  ('Dham', 'A traditional festive meal consisting of rice, pulses, rajma, and sweet rice cooked without onion or garlic.', 'Chopsticks Restaurant', 1.20, 450.00, 'Veg', 'Main Course', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800'),
  ('Tudkiya Bhath', 'Authentic Himachali pulao cooked with lentils, potatoes, yogurt, and aromatic spices.', 'Local Dhabas', 1.00, 150.00, 'Veg', 'Main Course', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800'),
  ('Momos', 'Tibetan style steamed or fried dumplings filled with vegetables or meat, highly popular in the hills.', 'Tibetan Kitchen', 1.50, 150.00, 'Both', 'Snack', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=800')
) AS v(name, description, recommended_restaurant, distance_from_hotel, approximate_cost, veg_non_veg, category, image)
WHERE NOT EXISTS (
  SELECT 1 FROM manali_food_recommendations WHERE name = v.name
);

-- 4. MANALI PACKING GUIDES
INSERT INTO manali_packing_guides (season, clothing, medicine, shoes, accessories, travel_essentials, additional_tips)
SELECT * FROM (VALUES
  ('Summer', 'Light cotton clothes for day, light jackets or sweaters for evenings.', 'Basic first aid, motion sickness pills, sunscreen.', 'Comfortable walking shoes, trekking shoes if hiking.', 'Sunglasses, hat/cap, light scarf.', 'Water bottle, power bank, cash.', 'Evenings can still be chilly, always carry a light jacket.'),
  ('Winter', 'Heavy woolens, thermals, windproof jackets, thick socks.', 'Cold medicine, lip balm, thick moisturizers.', 'Snow boots or sturdy waterproof trekking shoes.', 'Woolen caps, gloves, mufflers.', 'Thermos flask, extra batteries (drain fast in cold).', 'Layering is key to stay warm in freezing temperatures.'),
  ('Monsoon', 'Quick-dry clothes, waterproof jackets, raincoats.', 'Mosquito repellent, water purification tablets.', 'Waterproof shoes or rubber sandals/boots.', 'Umbrella, waterproof bags for electronics.', 'Ziplock bags, extra towels.', 'Be prepared for sudden road closures due to landslides.')
) AS v(season, clothing, medicine, shoes, accessories, travel_essentials, additional_tips)
WHERE NOT EXISTS (
  SELECT 1 FROM manali_packing_guides WHERE season = v.season
);

-- 5. MANALI WEATHER TIPS
INSERT INTO manali_weather_tips (season, title, description, safety_tips, expected_conditions, recommended_items)
SELECT * FROM (VALUES
  ('Summer', 'Pleasant and Clear', 'The best time to visit Manali with clear skies and pleasant weather.', 'Stay hydrated, carry sun protection.', 'Temperatures range between 10°C and 25°C.', 'Sunscreen, sunglasses, light jackets.'),
  ('Winter', 'Snowy and Cold', 'Experience magical snowfall and sub-zero temperatures.', 'Drive carefully on slippery roads, wear proper snow gear.', 'Temperatures drop below freezing, heavy snowfall expected.', 'Snow boots, heavy woolens, gloves.'),
  ('Monsoon', 'Lush Green but Risky', 'The valley turns vibrant green, but heavy rains can cause travel disruptions.', 'Avoid trekking or driving at night. Check weather updates before traveling.', 'Heavy rainfall, high humidity, landslides possible.', 'Raincoats, umbrellas, waterproof footwear.')
) AS v(season, title, description, safety_tips, expected_conditions, recommended_items)
WHERE NOT EXISTS (
  SELECT 1 FROM manali_weather_tips WHERE title = v.title
);

-- 6. MANALI EMERGENCY CONTACTS
INSERT INTO manali_emergency_contacts (service_name, phone_number, description, category, display_order)
SELECT * FROM (VALUES
  ('Police Station (Manali)', '100', 'Local Manali Police Station for immediate security assistance.', 'Security', 1),
  ('Mission Hospital Manali', '+91-1902-252379', 'Primary healthcare and emergency medical services.', 'Medical', 2),
  ('Ambulance', '108', 'Emergency medical transport.', 'Medical', 3),
  ('Fire Station', '101', 'For fire emergencies.', 'Emergency', 4),
  ('Hotel Reception', '+91-9876543210', '24/7 assistance for our hotel guests.', 'Internal', 5),
  ('Manali Taxi Union', '+91-1902-252450', 'Reliable local taxi services and immediate transport.', 'Transport', 6),
  ('Tourist Information Centre', '+91-1902-252175', 'Official HPTDC tourism helpline.', 'Information', 7)
) AS v(service_name, phone_number, description, category, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM manali_emergency_contacts WHERE service_name = v.service_name
);

-- 7. MANALI TRANSPORT
INSERT INTO manali_transport (transport_type, provider_name, description, distance_from_hotel, phone, opening_hours, estimated_cost)
SELECT * FROM (VALUES
  ('Taxi', 'Manali Taxi Union', 'Pre-paid and negotiated taxi services for local sightseeing and outstation trips.', 1.50, '+91-1902-252450', '24/7', 1500.00),
  ('Bus', 'HRTC Bus Stand', 'State-run buses connecting Manali to Delhi, Chandigarh, and local areas.', 1.00, '+91-1902-252323', '05:00 - 22:00', 50.00),
  ('Bike Rental', 'Himalayan Riders', 'Rent Royal Enfields and scooters for local exploration and Rohtang trips.', 2.00, '+91-9876500000', '08:00 - 20:00', 800.00),
  ('Auto Rickshaw', 'Local Auto Stand', 'Quick transport for short distances within Manali town.', 0.50, 'N/A', '06:00 - 22:00', 100.00)
) AS v(transport_type, provider_name, description, distance_from_hotel, phone, opening_hours, estimated_cost)
WHERE NOT EXISTS (
  SELECT 1 FROM manali_transport WHERE provider_name = v.provider_name
);
