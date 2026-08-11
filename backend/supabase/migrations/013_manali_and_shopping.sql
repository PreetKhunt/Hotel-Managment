-- ============================================================================
-- MIGRATION 013: Explore Manali & Shopping Brand Deals
-- ============================================================================

-- 1. MANALI PLACES
CREATE TABLE IF NOT EXISTS manali_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  distance_from_hotel NUMERIC(10, 2) NULL, -- in km
  approximate_travel_time VARCHAR(100) NULL,
  opening_time TIME NULL,
  closing_time TIME NULL,
  entry_fee NUMERIC(10, 2) DEFAULT 0.00,
  google_maps_url TEXT NULL,
  image VARCHAR(255) NULL,
  family_friendly BOOLEAN DEFAULT true,
  is_free_entry BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_manali_places_cat ON manali_places(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_manali_places_dist ON manali_places(distance_from_hotel) WHERE deleted_at IS NULL;

-- 2. MANALI ACTIVITIES
CREATE TABLE IF NOT EXISTS manali_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(50) NULL,
  approximate_cost NUMERIC(10, 2) DEFAULT 0.00,
  duration VARCHAR(100) NULL,
  distance_from_hotel NUMERIC(10, 2) NULL,
  suitable_for VARCHAR(255) NULL,
  season VARCHAR(100) NULL,
  image VARCHAR(255) NULL,
  google_maps_url TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_manali_activities_cat ON manali_activities(category) WHERE deleted_at IS NULL;

-- 3. MANALI FOOD RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS manali_food_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  recommended_restaurant VARCHAR(255) NULL,
  distance_from_hotel NUMERIC(10, 2) NULL,
  approximate_cost NUMERIC(10, 2) DEFAULT 0.00,
  veg_non_veg VARCHAR(50) CHECK (veg_non_veg IN ('Veg', 'Non-Veg', 'Both')),
  category VARCHAR(100) NULL,
  image VARCHAR(255) NULL,
  google_maps_url TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_manali_food_cat ON manali_food_recommendations(category) WHERE deleted_at IS NULL;

-- 4. MANALI PACKING GUIDES
CREATE TABLE IF NOT EXISTS manali_packing_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season VARCHAR(50) NOT NULL,
  clothing TEXT NULL,
  medicine TEXT NULL,
  shoes TEXT NULL,
  accessories TEXT NULL,
  travel_essentials TEXT NULL,
  additional_tips TEXT NULL,
  image VARCHAR(255) NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

-- 5. MANALI WEATHER TIPS
CREATE TABLE IF NOT EXISTS manali_weather_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  safety_tips TEXT NULL,
  expected_conditions TEXT NULL,
  recommended_items TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

-- 6. MANALI TRAVEL TIPS
CREATE TABLE IF NOT EXISTS manali_travel_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

-- 7. MANALI EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS manali_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

-- 8. MANALI TRANSPORT
CREATE TABLE IF NOT EXISTS manali_transport (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transport_type VARCHAR(100) NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  distance_from_hotel NUMERIC(10, 2) NULL,
  phone VARCHAR(50) NULL,
  opening_hours VARCHAR(100) NULL,
  google_maps_url TEXT NULL,
  estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
  image VARCHAR(255) NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

-- 9. USER FAVORITES
CREATE TABLE IF NOT EXISTS user_favorite_places (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES manali_places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, place_id)
);

CREATE TABLE IF NOT EXISTS user_favorite_activities (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES manali_activities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, activity_id)
);

CREATE TABLE IF NOT EXISTS user_favorite_foods (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES manali_food_recommendations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, food_id)
);

-- 10. PARTNER SHOPS
CREATE TABLE IF NOT EXISTS partner_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_name VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255) NULL,
  category VARCHAR(100) NOT NULL,
  owner_name VARCHAR(255) NULL,
  address TEXT NOT NULL,
  distance_from_hotel NUMERIC(10, 2) NULL,
  opening_hours VARCHAR(100) NULL,
  google_maps_url TEXT NULL,
  phone_number VARCHAR(50) NULL,
  description TEXT NULL,
  images JSONB NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_partner_shops_cat ON partner_shops(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_partner_shops_brand ON partner_shops(brand_name) WHERE deleted_at IS NULL;

-- 11. PARTNER OFFERS
CREATE TABLE IF NOT EXISTS partner_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES partner_shops(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  offer_type VARCHAR(100) NOT NULL,
  discount_value NUMERIC(10, 2) DEFAULT 0.00,
  expiry_date TIMESTAMPTZ NOT NULL,
  terms TEXT NULL,
  max_redemptions INTEGER DEFAULT 0, -- 0 means unlimited
  current_redemptions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

-- 12. USER COUPONS
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_code VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES partner_offers(id) ON DELETE CASCADE,
  partner_shop_id UUID NOT NULL REFERENCES partner_shops(id) ON DELETE CASCADE,
  discount_snapshot NUMERIC(10, 2) DEFAULT 0.00,
  expiry_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generated', 'redeemed', 'expired', 'cancelled')),
  generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  redeemed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_status ON user_coupons(status);

-- 13. Auto-update Timestamp Triggers
DROP TRIGGER IF EXISTS update_manali_places_modtime ON manali_places;
CREATE TRIGGER update_manali_places_modtime BEFORE UPDATE ON manali_places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manali_activities_modtime ON manali_activities;
CREATE TRIGGER update_manali_activities_modtime BEFORE UPDATE ON manali_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manali_food_modtime ON manali_food_recommendations;
CREATE TRIGGER update_manali_food_modtime BEFORE UPDATE ON manali_food_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manali_packing_modtime ON manali_packing_guides;
CREATE TRIGGER update_manali_packing_modtime BEFORE UPDATE ON manali_packing_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manali_weather_modtime ON manali_weather_tips;
CREATE TRIGGER update_manali_weather_modtime BEFORE UPDATE ON manali_weather_tips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manali_travel_modtime ON manali_travel_tips;
CREATE TRIGGER update_manali_travel_modtime BEFORE UPDATE ON manali_travel_tips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manali_emergency_modtime ON manali_emergency_contacts;
CREATE TRIGGER update_manali_emergency_modtime BEFORE UPDATE ON manali_emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manali_transport_modtime ON manali_transport;
CREATE TRIGGER update_manali_transport_modtime BEFORE UPDATE ON manali_transport FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_shops_modtime ON partner_shops;
CREATE TRIGGER update_partner_shops_modtime BEFORE UPDATE ON partner_shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_offers_modtime ON partner_offers;
CREATE TRIGGER update_partner_offers_modtime BEFORE UPDATE ON partner_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_coupons_modtime ON user_coupons;
CREATE TRIGGER update_user_coupons_modtime BEFORE UPDATE ON user_coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. RLS Policies
ALTER TABLE manali_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to manali_places" ON manali_places FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE manali_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to manali_activities" ON manali_activities FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE manali_food_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to manali_food_recommendations" ON manali_food_recommendations FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE manali_packing_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to manali_packing_guides" ON manali_packing_guides FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE manali_weather_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to manali_weather_tips" ON manali_weather_tips FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE manali_travel_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to manali_travel_tips" ON manali_travel_tips FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE manali_emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to manali_emergency_contacts" ON manali_emergency_contacts FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE manali_transport ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to manali_transport" ON manali_transport FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE user_favorite_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to user_favorite_places" ON user_favorite_places FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE user_favorite_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to user_favorite_activities" ON user_favorite_activities FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE user_favorite_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to user_favorite_foods" ON user_favorite_foods FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE partner_shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to partner_shops" ON partner_shops FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE partner_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to partner_offers" ON partner_offers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to user_coupons" ON user_coupons FOR ALL USING (true) WITH CHECK (true);
