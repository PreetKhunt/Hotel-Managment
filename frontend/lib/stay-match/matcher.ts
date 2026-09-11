import { Room } from '@/types';
import { FilterState } from '@/components/rooms/FilterSidebar';
import { StayMatchPreferences } from './types';
import { mapPreferencesToFilters } from './mapper';

/**
 * Reusable core filtering evaluation for standard FilterState & search strings.
 * Keeps filtering logic DRY across standard search and Intelligent Stay Match.
 */
export function matchesStandardFilters(room: Room, filters: FilterState, search: string = ''): boolean {
  // 1. Search text query
  if (search.trim()) {
    const q = search.toLowerCase();
    const hit =
      room.name.toLowerCase().includes(q) ||
      room.type.toLowerCase().includes(q) ||
      (room.description || '').toLowerCase().includes(q) ||
      (room.amenities || []).some((a) => a.toLowerCase().includes(q));
    if (!hit) return false;
  }

  // 2. Room category type — only apply if caller explicitly set types
  if (filters.types.length > 0 && !filters.types.some(t => t.toLowerCase() === room.type.toLowerCase())) {
    return false;
  }

  // 3. Nightly price range
  if (room.pricePerNight < filters.minPrice) return false;
  if (filters.maxPrice > 0 && room.pricePerNight > filters.maxPrice) return false;

  // 4. Guest capacity
  if (filters.guests > 0 && room.maxGuests < filters.guests) return false;

  // 5. Mandatory amenities (only applied when caller explicitly passes amenities)
  if (filters.amenities.length > 0) {
    const hasAll = filters.amenities.every((fa) =>
      (room.amenities || []).some((ra) => ra.toLowerCase().includes(fa.toLowerCase()))
    );
    if (!hasAll) return false;
  }

  // 6. Minimum star rating
  if (filters.minRating > 0 && (room.rating || 0) < filters.minRating) return false;

  return true;
}

/**
 * Evaluates whether a Room aligns with specific environment preferences
 * based on concrete room attributes: floors, category types, capacity, amenities, descriptions.
 * Returns a 0–1 score rather than a boolean for nuanced partial matching.
 */
function environmentScore(room: Room, env: string): number {
  const loweredDesc = `${room.description || ''} ${room.longDescription || ''}`.toLowerCase();
  const loweredAmenities = (room.amenities || []).join(' ').toLowerCase();
  const roomType = room.type.toLowerCase();

  switch (env) {
    case 'Luxury':
      // Suite/Presidential/Deluxe types or high rating
      if (['presidential', 'suite'].includes(roomType)) return 1;
      if (['deluxe', 'premium', 'executive'].includes(roomType)) return 0.7;
      if ((room.rating || 0) >= 4.7) return 0.5;
      return 0.2; // Standard rooms still get some partial credit
    case 'Scenic View':
      if (loweredAmenities.includes('view') || loweredAmenities.includes('ocean') ||
          loweredAmenities.includes('balcony') || loweredDesc.includes('view') ||
          loweredDesc.includes('scenic') || loweredDesc.includes('panorama')) return 1;
      if (['suite', 'presidential'].includes(roomType)) return 0.5; // likely have views
      return 0.1;
    case 'High Floor':
      if (room.floor !== undefined && room.floor >= 3) return 1;
      if (['suite', 'presidential'].includes(roomType)) return 0.6;
      if (loweredDesc.includes('high floor') || loweredDesc.includes('skyline')) return 1;
      return 0.2;
    case 'Family Friendly':
      if (room.maxGuests >= 4) return 1;
      if (room.maxGuests >= 3) return 0.7;
      if (loweredAmenities.includes('pool') || loweredDesc.includes('family')) return 0.5;
      return 0.1;
    case 'Quiet':
      if ((room.floor !== undefined && room.floor >= 2) ||
          ['suite', 'presidential'].includes(roomType)) return 0.8;
      if (loweredDesc.includes('quiet') || loweredDesc.includes('serene') || loweredDesc.includes('peaceful')) return 1;
      return 0.3; // reasonable fallback — all hotel rooms can be quiet
    case 'Near Elevator':
      if (room.floor !== undefined && room.floor <= 2) return 1;
      if (loweredDesc.includes('elevator') || loweredDesc.includes('accessible')) return 1;
      return 0.4; // reasonable fallback
    default:
      return 0.5;
  }
}

/**
 * Scores and ranks rooms against guided questionnaire preferences.
 *
 * The scoring model uses soft scoring rather than hard rejection for subjective preferences
 * (amenities, environment, bed type, purpose) so that every reasonable combination of
 * wizard answers always produces a ranked list of rooms.
 *
 * Only truly objective constraints (price range, guest capacity, minimum rating) are used
 * as hard filters. All other signals contribute to a 0–100 match score.
 */
export function matchRoomsWithPreferences(rooms: Room[], prefs: StayMatchPreferences): Room[] {
  const baseFilters = mapPreferencesToFilters(prefs);

  const scoredRooms = rooms.map((room) => {
    // Hard constraints: Reject rooms that don't pass price/capacity/rating checks.
    // Note: baseFilters.types is always [] from mapPreferencesToFilters (by design),
    // so type is never a hard rejection — it's a scoring factor only.
    if (!matchesStandardFilters(room, baseFilters, '')) {
      return { ...room, matchScore: -1 }; // use -1 to distinguish hard-rejected from scored
    }

    let score = 0;
    const roomType = room.type.toLowerCase();
    const loweredAmenities = (room.amenities || []).join(' ').toLowerCase();

    // ── 1. Amenity Match (30 pts) ─────────────────────────────────────────────
    if (prefs.amenities && prefs.amenities.length > 0) {
      const matchedCount = prefs.amenities.filter((fa) =>
        (room.amenities || []).some((ra) => ra.toLowerCase().includes(fa.toLowerCase()))
      ).length;
      score += (matchedCount / prefs.amenities.length) * 30;
    } else {
      score += 30; // No preference → full points
    }

    // ── 2. Environment Match (20 pts) ─────────────────────────────────────────
    if (prefs.environment && prefs.environment.length > 0) {
      const envTotal = prefs.environment.reduce((sum, env) => sum + environmentScore(room, env), 0);
      score += (envTotal / prefs.environment.length) * 20;
    } else {
      score += 20; // No preference → full points
    }

    // ── 3. Bed Type Match (15 pts) ────────────────────────────────────────────
    if (prefs.bedType && prefs.bedType !== 'No Preference') {
      const roomBed = (room.bedType || '').toLowerCase();
      const desiredBed = prefs.bedType.toLowerCase();

      if (roomBed.includes(desiredBed)) {
        score += 15;
      } else if (desiredBed === 'king' && (roomBed.includes('king') || roomBed.includes('queen'))) {
        score += 10;
      } else if (desiredBed === 'double' && (roomBed.includes('queen') || roomBed.includes('king'))) {
        score += 10; // Queen/King are "double" equivalents
      } else if (desiredBed === 'twin' && (roomBed.includes('twin') || roomBed.includes('two'))) {
        score += 15;
      } else if (desiredBed === 'single' && room.maxGuests >= 1) {
        score += 8; // All rooms accommodate singles
      } else {
        score += 5; // Partial credit — bed type not ideal but room still eligible
      }
    } else {
      score += 15; // No preference → full points
    }

    // ── 4. Purpose Alignment (20 pts) ─────────────────────────────────────────
    if (prefs.purpose) {
      switch (prefs.purpose) {
        case 'Honeymoon':
          if (['suite', 'presidential'].includes(roomType)) score += 20;
          else if (['deluxe', 'premium', 'executive'].includes(roomType)) score += 14;
          else score += 7;
          break;
        case 'Business':
          if (loweredAmenities.includes('wifi') || loweredAmenities.includes('wi-fi')) score += 20;
          else if (['executive', 'premium', 'deluxe'].includes(roomType)) score += 14;
          else score += 10;
          break;
        case 'Family Vacation':
          if (room.maxGuests >= 4) score += 20;
          else if (room.maxGuests >= 3) score += 14;
          else score += 6;
          break;
        case 'Friends':
          if (room.maxGuests >= 3) score += 18;
          else if (room.maxGuests >= 2) score += 12;
          else score += 6;
          break;
        case 'Solo':
          // Solo travellers benefit from any room; smaller/cozier rooms preferred
          if (['standard'].includes(roomType)) score += 18;
          else if (room.maxGuests <= 2) score += 15;
          else score += 10;
          break;
        case 'Leisure':
        default:
          // Leisure adapts to any room — give full points
          score += 15;
          break;
      }
    } else {
      score += 20; // No preference → full points
    }

    // ── 5. Budget Tier Alignment (15 pts) ─────────────────────────────────────
    // Reward rooms that sit comfortably within the selected tier (not just under the cap).
    if (prefs.budget && baseFilters.maxPrice > 0) {
      const midpoint = baseFilters.maxPrice * 0.6; // ideal price is ~60% of cap
      const deviation = Math.abs(room.pricePerNight - midpoint) / baseFilters.maxPrice;
      score += Math.max(0, (1 - deviation) * 15);
    } else {
      score += 15;
    }

    return { ...room, matchScore: Math.round(score) };
  });

  // Exclude hard-rejected rooms (matchScore === -1), then sort best-first.
  // All other rooms with matchScore >= 0 are returned — even lower-scoring ones —
  // so the user always sees something useful rather than an empty state.
  const eligible = scoredRooms.filter(r => (r.matchScore ?? -1) >= 0);

  if (eligible.length === 0) {
    // Ultimate fallback: if all rooms were hard-rejected (extremely unlikely),
    // return all rooms sorted by rating so the user is never shown an empty state.
    return [...rooms].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return eligible.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}
