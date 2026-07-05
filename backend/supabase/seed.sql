-- Supabase Seed Data for Hospitality Hub
-- Run this AFTER running schema.sql

-- 1. Seed Users (Demo Data)
INSERT INTO users (id, name, email, phone, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@hospitalityhub.com', '+1234567890', 'admin'),
('22222222-2222-2222-2222-222222222222', 'James Morrison', 'james@example.com', '+1987654321', 'guest'),
('33333333-3333-3333-3333-333333333333', 'Sophia Chen', 'sophia@example.com', '+1122334455', 'guest');

-- 2. Seed Rooms
INSERT INTO rooms (id, name, type, price_per_night, capacity, status, description, images) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Deluxe Ocean View', 'Deluxe', 24000.00, 2, 'available', 'Experience breathtaking ocean views in our premium deluxe room featuring a king-size bed, private balcony, and luxurious amenities.', '["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200", "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200", "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200"]'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Premium Suite', 'Suite', 44000.00, 4, 'available', 'Spacious suite with a separate living area, panoramic city views, complimentary mini-bar, and exclusive lounge access.', '["https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200", "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200", "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200", "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200", "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=1200"]'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Standard Double', 'Standard', 12000.00, 2, 'available', 'Comfortable and cozy room with two twin beds, high-speed Wi-Fi, and a modern bathroom.', '["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200", "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200", "https://images.unsplash.com/photo-1560067174-c5a3a8f37060?w=1200", "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200"]'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Presidential Villa', 'Villa', 96000.00, 6, 'available', 'The ultimate luxury experience. A private villa with a private pool, 24/7 butler service, and private beach access.', '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200", "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200", "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200"]'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Family Suite', 'Suite', 36000.00, 5, 'occupied', 'Perfect for families. Includes a master bedroom, a connected kids room with bunk beds, and a kitchenette.', '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200", "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200", "https://images.unsplash.com/photo-1598928506311-c55d43f9241f?w=1200", "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200"]');

-- 3. Seed Services
INSERT INTO services (name, price, description) VALUES 
('Airport Transfer', 50.00, 'Luxury car transfer to and from the airport.'),
('Spa Package', 120.00, 'Full body massage and facial treatment.'),
('In-Room Dining', 0.00, '24/7 room service available (prices vary per item).'),
('City Tour', 80.00, 'Guided tour around the city''s top attractions.');

-- 4. Seed Bookings (Mock past/current bookings)
INSERT INTO bookings (id, user_id, room_id, check_in, check_out, guests, total_amount, status) VALUES 
('99999999-9999-9999-9999-999999999991', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '9 days', 2, 1196.00, 'confirmed'),
('99999999-9999-9999-9999-999999999992', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', 2, 1098.00, 'pending');

-- 5. Seed Payments
INSERT INTO payments (booking_id, razorpay_order_id, razorpay_payment_id, amount, status) VALUES 
('99999999-9999-9999-9999-999999999991', 'order_mock12345', 'pay_mock12345', 1196.00, 'success');

-- 6. Seed Reviews
INSERT INTO reviews (user_id, room_id, rating, comment) VALUES 
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Absolutely stunning views and the service was impeccable.'),
('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 4, 'Very comfortable stay, though the Wi-Fi was slightly slow in the evenings.');
