import { FilterState } from '@/components/rooms/FilterSidebar';
import { StayMatchPreferences } from './types';

export const DEFAULT_FILTER_STATE: FilterState = {
  types: [],
  minPrice: 0,
  maxPrice: 200000,
  guests: 0,
  amenities: [],
  minRating: 0,
};

/**
 * Converts guided questionnaire answers into the existing Room search & filter model.
 * Deterministically maps travel purpose, budget tiers, occupancy, and desired amenities.
 */
export function mapPreferencesToFilters(prefs: StayMatchPreferences): FilterState {
  const next: FilterState = {
    ...DEFAULT_FILTER_STATE,
    amenities: [...(prefs.amenities || [])],
  };

  // 1. Map Budget Tiers
  if (prefs.budget === '2000-3000') {
    next.minPrice = 0;
    next.maxPrice = 3500;
  } else if (prefs.budget === '3000-5000') {
    next.minPrice = 2500;
    next.maxPrice = 6000;
  } else if (prefs.budget === '5000+') {
    next.minPrice = 4000;
    next.maxPrice = 200000;
  }

  // 2. Map Guest Count
  if (prefs.guests) {
    next.guests = prefs.guests;
  }

  // 3. Map Purpose to recommended core filters & room types
  if (prefs.purpose === 'Business') {
    // Ensure fast WiFi or work desk vibe is favored in amenity filter if explicitly desired
    // We add core WiFi if not already present
    if (!next.amenities.some(a => a.toLowerCase().includes('wifi'))) {
      next.amenities.push('WiFi');
    }
  } else if (prefs.purpose === 'Family Vacation') {
    if (next.guests === 0) next.guests = 3; // ensure minimum family capacity if unspecified
  } else if (prefs.purpose === 'Honeymoon') {
    // Favor suites & luxury accommodations
    next.minRating = 4;
  } else if (prefs.purpose === 'Leisure' || prefs.purpose === 'Solo' || prefs.purpose === 'Friends') {
    // Standard preference propagation
  }

  // 4. Map Environment to room types or ratings when appropriate
  if (prefs.environment && prefs.environment.includes('Luxury')) {
    if (!next.types.includes('suite') && !next.types.includes('presidential') && !next.types.includes('deluxe')) {
      next.types.push('deluxe', 'suite', 'presidential');
    }
  }

  return next;
}
