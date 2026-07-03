import { useQuery } from '@tanstack/react-query';
import { Room } from '@/types';
import api from '@/lib/api';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async (): Promise<Room[]> => {
      const response = await api.get('/rooms');
      return response.data.data;
    },
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async (): Promise<Room> => {
      const response = await api.get(`/rooms/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}
