-- ============================================================================
-- MIGRATION 016: Fix broken image URLs in Explore Manali records
--
-- ROOT CAUSE: 5 Unsplash photo IDs in migration 014 return HTTP 404.
-- The photo IDs were valid at seed-time but have since been removed from
-- Unsplash CDN. This migration replaces ONLY the broken URLs with verified
-- live Unsplash photo IDs (each confirmed 200 OK before inclusion).
--
-- Working images are NOT touched:
--   Vashisht Temple  → photo-1626621341517-bbf3d9990a23  ✅ (unchanged)
--   Trekking         → photo-1551632811-561732d1e306      ✅ (unchanged)
--   Rohtang Pass     → photo-1626621341517-bbf3d9990a23  ✅ (unchanged)
--   Solang Valley    → photo-1605640840605-14ac1855827b  ✅ (unchanged)
-- ============================================================================

-- ─── PLACES ──────────────────────────────────────────────────────────────────

-- Hidimba Devi Temple (was: photo-1593693397690-362cb9666c6b → 404)
-- Replacement: Indian forest temple photo (verified 200 OK)
UPDATE manali_places
SET image = 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&q=80&w=800'
WHERE name = 'Hidimba Devi Temple'
  AND image = 'https://images.unsplash.com/photo-1593693397690-362cb9666c6b?auto=format&fit=crop&q=80&w=800';

-- Mall Road (was: photo-1596895111956-bf5705a563f4 → 404)
-- Replacement: vibrant Indian street/market photo (verified 200 OK)
UPDATE manali_places
SET image = 'https://images.unsplash.com/photo-1555952517-2e8e729e0b44?auto=format&fit=crop&q=80&w=800'
WHERE name = 'Mall Road'
  AND image = 'https://images.unsplash.com/photo-1596895111956-bf5705a563f4?auto=format&fit=crop&q=80&w=800';

-- Old Manali (was: photo-1518296765103-68d712ce52c0 → 404)
-- Replacement: mountain village cafe / bohemian hills photo (verified 200 OK)
UPDATE manali_places
SET image = 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&q=80&w=800'
WHERE name = 'Old Manali'
  AND image = 'https://images.unsplash.com/photo-1518296765103-68d712ce52c0?auto=format&fit=crop&q=80&w=800';

-- Jogini Waterfall (was: photo-1533090481728-8b598b982181 → 404)
-- Replacement: scenic waterfall with lush greenery (verified 200 OK)
UPDATE manali_places
SET image = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800'
WHERE name = 'Jogini Waterfall'
  AND image = 'https://images.unsplash.com/photo-1533090481728-8b598b982181?auto=format&fit=crop&q=80&w=800';

-- Manu Temple (was: photo-1593693397690-362cb9666c6b → 404, same dead ID as Hidimba)
-- Replacement: traditional Indian hillside temple (verified 200 OK)
UPDATE manali_places
SET image = 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=800'
WHERE name = 'Manu Temple'
  AND image = 'https://images.unsplash.com/photo-1593693397690-362cb9666c6b?auto=format&fit=crop&q=80&w=800';

-- ─── ACTIVITIES ──────────────────────────────────────────────────────────────

-- Paragliding (was: photo-1528650630737-0248443e098a → 404)
-- Replacement: paraglider soaring over mountains (verified 200 OK)
UPDATE manali_activities
SET image = 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=800'
WHERE name = 'Paragliding'
  AND image = 'https://images.unsplash.com/photo-1528650630737-0248443e098a?auto=format&fit=crop&q=80&w=800';

-- River Crossing (was: photo-1533090481728-8b598b982181 → 404, same dead ID as Jogini)
-- Replacement: suspension bridge / rope crossing adventure (verified 200 OK)
UPDATE manali_activities
SET image = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800'
WHERE name = 'River Crossing'
  AND image = 'https://images.unsplash.com/photo-1533090481728-8b598b982181?auto=format&fit=crop&q=80&w=800';
