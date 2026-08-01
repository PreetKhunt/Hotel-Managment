import { Room } from '@/types';
import { RoomBadge, StayMatchPreferences } from './types';

/**
 * Generates structured recommendation badge objects deterministically based on room attributes
 * and user questionnaire preferences. Returns top high-priority badges for UI presentation.
 */
export function generateRoomBadges(room: Room, prefs: StayMatchPreferences): RoomBadge[] {
  const badges: RoomBadge[] = [];
  const addBadge = (badge: RoomBadge) => {
    if (!badges.some((b) => b.id === badge.id)) {
      badges.push(badge);
    }
  };

  const loweredAmenities = (room.amenities || []).join(' ').toLowerCase();
  const loweredDesc = `${room.description} ${room.longDescription || ''}`.toLowerCase();

  // 1. Budget Match Badge
  if (prefs.budget) {
    addBadge({
      id: 'badge-budget',
      label: 'Matches Your Budget',
      icon: '✓',
      variant: 'budget',
      color: '#34D399',
      bgColor: 'rgba(16, 185, 129, 0.15)',
    });
  }

  // 2. Travel Purpose Badges
  if (prefs.purpose === 'Business') {
    addBadge({
      id: 'badge-purpose-business',
      label: 'Ideal for Business',
      icon: '💼',
      variant: 'purpose',
      color: '#60A5FA',
      bgColor: 'rgba(59, 130, 246, 0.15)',
    });
  } else if (prefs.purpose === 'Family Vacation' || (prefs.guests && prefs.guests >= 3)) {
    if (room.maxGuests >= 3) {
      addBadge({
        id: 'badge-family',
        label: 'Great for Family',
        icon: '👨‍👩‍👧',
        variant: 'family',
        color: '#F472B6',
        bgColor: 'rgba(236, 72, 153, 0.15)',
      });
    }
  } else if (prefs.purpose === 'Honeymoon') {
    addBadge({
      id: 'badge-purpose-honeymoon',
      label: 'Romantic Haven',
      icon: '🥂',
      variant: 'purpose',
      color: '#F9A8D4',
      bgColor: 'rgba(244, 114, 182, 0.15)',
    });
  }

  // 3. Bed Type Badges
  if ((prefs.bedType === 'King' || (room.bedType && room.bedType.toLowerCase().includes('king')))) {
    if (room.bedType && room.bedType.toLowerCase().includes('king')) {
      addBadge({
        id: 'badge-bed-king',
        label: 'King Bed',
        icon: '🛏️',
        variant: 'bed',
        color: '#C9A84C',
        bgColor: 'rgba(201, 168, 76, 0.15)',
      });
    }
  } else if (prefs.bedType && prefs.bedType !== 'No Preference' && room.bedType) {
    addBadge({
      id: 'badge-bed-preferred',
      label: room.bedType,
      icon: '🛏️',
      variant: 'bed',
      color: '#C9A84C',
      bgColor: 'rgba(201, 168, 76, 0.15)',
    });
  }

  // 4. Standout Amenities & Views
  if (loweredAmenities.includes('view') || loweredAmenities.includes('ocean') || loweredDesc.includes('scenic')) {
    addBadge({
      id: 'badge-view-scenic',
      label: 'Scenic View',
      icon: '🌅',
      variant: 'view',
      color: '#38BDF8',
      bgColor: 'rgba(56, 189, 248, 0.15)',
    });
  }

  if (loweredAmenities.includes('bathtub') || loweredAmenities.includes('tub') || loweredDesc.includes('soak')) {
    addBadge({
      id: 'badge-amenity-tub',
      label: 'Bathtub Included',
      icon: '🛁',
      variant: 'amenity',
      color: '#A78BFA',
      bgColor: 'rgba(139, 92, 246, 0.15)',
    });
  }

  if (loweredAmenities.includes('breakfast')) {
    addBadge({
      id: 'badge-amenity-breakfast',
      label: 'Breakfast Included',
      icon: '☕',
      variant: 'amenity',
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
    });
  }

  // 5. Luxury Choice Tag for top tier accommodations
  if (['suite', 'presidential', 'deluxe'].includes(room.type.toLowerCase()) || room.rating >= 4.7) {
    addBadge({
      id: 'badge-luxury',
      label: 'Luxury Choice',
      icon: '👑',
      variant: 'luxury',
      color: '#E8C96A',
      bgColor: 'rgba(201, 168, 76, 0.2)',
    });
  }

  // Limit returned badges to top 4 to preserve card aesthetics and avoid clutter
  return badges.slice(0, 4);
}
