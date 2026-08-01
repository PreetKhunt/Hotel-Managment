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

  return rooms.filter((room) => {
    // Step 1: Must pass standard price, occupancy, category, and amenity criteria
    if (!matchesStandardFilters(room, baseFilters, '')) {
      return false;
    }

    // Step 2: Bed Preference Check (if explicitly requested)
    if (prefs.bedType && prefs.bedType !== 'No Preference') {
      const roomBed = (room.bedType || '').toLowerCase();
      const desiredBed = prefs.bedType.toLowerCase();
      
      // Allow flexible compatibility (e.g. King bed covers Double/Twin expectations in luxury suites)
      const isMatch = roomBed.includes(desiredBed) ||
        (desiredBed === 'double' && (roomBed.includes('king') || roomBed.includes('queen'))) ||
        (desiredBed === 'single' && room.maxGuests >= 1);

      if (!isMatch) return false;
    }

    // Step 3: Environment Attributes Check (at least one environment attribute should align if selected)
    if (prefs.environment && prefs.environment.length > 0) {
      const matchesAtLeastOneEnv = prefs.environment.some((env) => matchesEnvironmentAttribute(room, env));
      if (!matchesAtLeastOneEnv) return false;
    }

    return true;
  });
}
