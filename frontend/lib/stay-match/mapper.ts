import { FilterState } from '@/components/rooms/FilterSidebar';
import { StayMatchPreferences } from './types';

export const DEFAULT_FILTER_STATE: FilterState = {
  types: [],
  minPrice: 0,
  maxPrice: 600000,
  guests: 0,
  amenities: [],
  minRating: 0,
};

/**
 * Converts guided questionnaire answers into the existing Room search & filter model.
 * Deterministically maps travel purpose, budget tiers, occupancy, and desired amenities.
 *
 * NOTE on budget tiers: The wizard labels show ₹2k–₹3k / ₹3k–₹5k / ₹5k+ as relative
 * luxury tiers (entry / mid / premium), NOT absolute per-night INR caps. The actual room
 * inventory starts at ~₹5,000/night (Deluxe entry) and goes up to ₹4,60,000/night (Presidential).
 * We map each tier to a generous inclusive price window so that EVERY tier always returns rooms.
 */
export function mapPreferencesToFilters(prefs: StayMatchPreferences): FilterState {
  const next: FilterState = {
    ...DEFAULT_FILTER_STATE,
    // Amenities are intentionally left empty here so `matchesStandardFilters` does NOT
    // perform a strict hard-reject on rooms missing a single soft amenity.
    // Soft amenities are evaluated as scoring bonuses in the scoring engine.
  };

  // 1. Map Budget Tiers → inclusive price windows that always capture rooms from inventory.
  //    Entry tier  (₹2k–₹3k label) → Standard & Deluxe rooms (₹10k–₹17k range)
  //    Mid tier    (₹3k–₹5k label) → Deluxe, Premium, Executive, entry Suite (up to ₹30k)
  //    Premium tier (₹5k+ label)   → all rooms including Suites & Presidential (no cap)
  if (prefs.budget === '2000-3000') {
    next.minPrice = 0;
    next.maxPrice = 17000; // Standard + entry Deluxe
  } else if (prefs.budget === '3000-5000') {
    next.minPrice = 0;
    next.maxPrice = 30000; // Deluxe, Premium, Executive, lower Suites
  } else if (prefs.budget === '5000+') {
    next.minPrice = 0;
    next.maxPrice = 600000; // No cap — all rooms eligible
  }
  // If budget is unset, DEFAULT_FILTER_STATE wide range applies (0–600000)

  // 2. Map Guest Count → minimum room capacity required.
  //    GuestCount 4 means "4+" in the wizard; room.maxGuests >= 4 passes correctly.
  if (prefs.guests) {
    next.guests = prefs.guests;
  }

  // 3. Purpose → soft guidance only; hard type/amenity filters removed to prevent zero results.
  //    Business: WiFi preference is handled as a scoring bonus in the scoring engine.
  //    Family Vacation: bump minimum guests to 3 if user forgot to specify.
  //    Honeymoon: slightly raise the minimum rating bar for romantic stays.
  if (prefs.purpose === 'Family Vacation') {
    if (next.guests === 0) next.guests = 3;
  } else if (prefs.purpose === 'Honeymoon') {
    next.minRating = 4.5;
  }

  // 4. Luxury environment preference → scoring bonus only (NOT a hard type restriction).
  //    Previously this added types: ['deluxe', 'suite', 'presidential'] as a hard filter,
  //    which rejected perfectly good rooms (Premium/Executive) and caused empty results.
  //    Luxury scoring is handled inside matchRoomsWithPreferences instead.

  return next;
}
