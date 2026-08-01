import { useState, useMemo, useCallback } from 'react';
import { Room } from '@/types';
import {
  StayMatchPreferences,
  RoomBadge,
  matchRoomsWithPreferences,
  generateRoomBadges,
} from '@/lib/stay-match';

export interface UseStayMatchReturn {
  isWizardOpen: boolean;
  activePreferences: StayMatchPreferences | null;
  isMatchActive: boolean;
  matchedRooms: Room[];
  openWizard: () => void;
  closeWizard: () => void;
  applyPreferences: (prefs: StayMatchPreferences) => void;
  clearPreferences: () => void;
  getBadgesForRoom: (room: Room) => RoomBadge[];
}

/**
 * Custom hook managing Intelligent Stay Match modal state, active user preferences,
 * memoized room matching computations, and dynamic recommendation badge retrieval.
 */
export function useStayMatch(allRooms: Room[]): UseStayMatchReturn {
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [activePreferences, setActivePreferences] = useState<StayMatchPreferences | null>(null);

  const openWizard = useCallback(() => {
    setIsWizardOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsWizardOpen(false);
  }, []);

  const applyPreferences = useCallback((prefs: StayMatchPreferences) => {
    setActivePreferences(prefs);
    setIsWizardOpen(false);
  }, []);

  const clearPreferences = useCallback(() => {
    setActivePreferences(null);
  }, []);

  const isMatchActive = Boolean(activePreferences);

  // Memoized evaluation of matching rooms against current questionnaire preferences
  const matchedRooms = useMemo(() => {
    if (!activePreferences || !allRooms.length) {
      return allRooms;
    }
    return matchRoomsWithPreferences(allRooms, activePreferences);
  }, [allRooms, activePreferences]);

  // Memoized callback to retrieve custom recommendation badges for a given room
  const getBadgesForRoom = useCallback(
    (room: Room): RoomBadge[] => {
      if (!activePreferences) return [];
      return generateRoomBadges(room, activePreferences);
    },
    [activePreferences]
  );

  return {
    isWizardOpen,
    activePreferences,
    isMatchActive,
    matchedRooms,
    openWizard,
    closeWizard,
    applyPreferences,
    clearPreferences,
    getBadgesForRoom,
  };
}
