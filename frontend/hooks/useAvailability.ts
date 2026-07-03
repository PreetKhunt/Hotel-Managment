import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface CalendarDay {
  date: string;
  isAvailable: boolean;
  priceModifier?: number;
  reason?: string;
}

export function useAvailabilityCalendar(roomId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['availability', roomId, startDate, endDate],
    queryFn: async (): Promise<CalendarDay[]> => {
      const response = await api.get('/availability/calendar', {
        params: { roomId, startDate, endDate }
      });
      return response.data.data;
    },
    enabled: !!roomId && !!startDate && !!endDate,
  });
}
