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

  // 2. Room category type
  if (filters.types.length > 0 && !filters.types.includes(room.type.toLowerCase())) {
    return false;
  }

  // 3. Nightly price range
  if (room.pricePerNight < filters.minPrice) return false;
  if (filters.maxPrice > 0 && room.pricePerNight > filters.maxPrice) return false;

  // 4. Guest capacity
  if (filters.guests > 0 && room.maxGuests < filters.guests) return false;

  // 5. Mandatory amenities
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
 * Evaluates whether a Room deterministically aligns with specific environment preferences
 * based on concrete attributes: floors, category types, capacity, and verified amenities/descriptions.
 */
function matchesEnvironmentAttribute(room: Room, env: string): boolean {
  const loweredDesc = `${room.description} ${room.longDescription || ''}`.toLowerCase();
  const loweredAmenities = (room.amenities || []).join(' ').toLowerCase();

  switch (env) {
    case 'Luxury':
      return ['deluxe', 'suite', 'presidential'].includes(room.type.toLowerCase()) || room.rating >= 4.5;
    case 'Scenic View':
      return loweredAmenities.includes('view') || loweredAmenities.includes('ocean') || 
             loweredAmenities.includes('balcony') || loweredDesc.includes('view') || 
             loweredDesc.includes('scenic') || loweredDesc.includes('panorama');
    case 'High Floor':
      return (room.floor !== undefined && room.floor >= 3) || 
             ['suite', 'presidential'].includes(room.type.toLowerCase()) || 
             loweredDesc.includes('high floor') || loweredDesc.includes('skyline');
    case 'Family Friendly':
      return room.maxGuests >= 3 || loweredAmenities.includes('pool') || 
             loweredDesc.includes('family') || room.type === 'suite';
    case 'Quiet':
      return (room.floor !== undefined && room.floor >= 2) || 
             ['suite', 'presidential'].includes(room.type.toLowerCase()) || 
             loweredDesc.includes('quiet') || loweredDesc.includes('serene') || loweredDesc.includes('peaceful');
    case 'Near Elevator':
      return (room.floor !== undefined && room.floor <= 2) || 
             loweredDesc.includes('elevator') || loweredDesc.includes('convenience') || loweredDesc.includes('accessible');
    default:
      return true;
  }
}

/**
 * Deterministically finds all rooms that match the guided preference questionnaire.
 * Uses strict filter mapping first, then evaluates extended attributes (bed type and environment).
 */
export function matchRoomsWithPreferences(rooms: Room[], prefs: StayMatchPreferences): Room[] {
  const baseFilters = mapPreferencesToFilters(prefs);

  const scoredRooms = rooms.map((room) => {
    // Hard constraints: Reject rooms that don't pass standard occupancy/price/category checks
    if (!matchesStandardFilters(room, baseFilters, '')) {
      return { ...room, matchScore: 0 };
    }

    let score = 0;
    
    // 1. Amenities (40%)
    if (prefs.amenities && prefs.amenities.length > 0) {
      const matchedAmenities = prefs.amenities.filter((fa) =>
        (room.amenities || []).some((ra) => ra.toLowerCase().includes(fa.toLowerCase()))
      );
      score += (matchedAmenities.length / prefs.amenities.length) * 40;
    } else {
      score += 40; // No preference, full points
    }

    // 2. Environment (20%)
    if (prefs.environment && prefs.environment.length > 0) {
      const matchedEnv = prefs.environment.filter((env) => matchesEnvironmentAttribute(room, env));
      score += (matchedEnv.length / prefs.environment.length) * 20;
    } else {
      score += 20;
    }

    // 3. Bed Type (15%)
    if (prefs.bedType && prefs.bedType !== 'No Preference') {
      const roomBed = (room.bedType || '').toLowerCase();
      const desiredBed = prefs.bedType.toLowerCase();
      
      const isMatch = roomBed.includes(desiredBed) ||
        (desiredBed === 'double' && (roomBed.includes('king') || roomBed.includes('queen'))) ||
        (desiredBed === 'single' && room.maxGuests >= 1);

      if (isMatch) score += 15;
    } else {
      score += 15;
    }

    // 4. Purpose (15%)
    if (prefs.purpose) {
      const roomType = room.type.toLowerCase();
      if (prefs.purpose === 'Honeymoon' && ['suite', 'presidential'].includes(roomType)) score += 15;
      else if (prefs.purpose === 'Business' && (room.amenities || []).join(' ').toLowerCase().includes('wifi')) score += 15;
      else if (prefs.purpose === 'Family Vacation' && room.maxGuests >= 3) score += 15;
      else score += 10; // Partial points for unspecific purposes
    } else {
      score += 15;
    }

    // 5. Price Competitiveness (10%)
    // Reward cheaper rooms within budget
    if (baseFilters.maxPrice > 0) {
      const priceRatio = 1 - (room.pricePerNight / baseFilters.maxPrice);
      score += Math.max(0, priceRatio * 10);
    } else {
      score += 10;
    }

    return { ...room, matchScore: Math.round(score) };
  });

  return scoredRooms
    .filter(r => (r.matchScore ?? 0) > 0) // Filter out hard constraints and 0 scores
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}
