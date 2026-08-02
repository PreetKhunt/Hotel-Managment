import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRoom: Partial<Room>): Promise<Room> => {
      const response = await api.post('/rooms', newRoom);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Room> }): Promise<Room> => {
      const response = await api.put(`/rooms/${id}`, data);
      return response.data.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['rooms'] });
      await queryClient.cancelQueries({ queryKey: ['room', id] });

      const previousRooms = queryClient.getQueryData<Room[]>(['rooms']);
      const previousRoom = queryClient.getQueryData<Room>(['room', id]);

      if (previousRooms) {
        queryClient.setQueryData<Room[]>(['rooms'], (old) =>
          old ? old.map((room) => (room.id === id ? { ...room, ...data } : room)) : []
        );
      }

      if (previousRoom) {
        queryClient.setQueryData<Room>(['room', id], (old) => (old ? { ...old, ...data } : old));
      }

      return { previousRooms, previousRoom };
    },
    onError: (_err, newTodo, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(['rooms'], context.previousRooms);
      }
      if (context?.previousRoom && newTodo.id) {
        queryClient.setQueryData(['room', newTodo.id], context.previousRoom);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', id] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
