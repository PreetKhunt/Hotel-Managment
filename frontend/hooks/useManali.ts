import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { manaliApi } from '../lib/api/manali';
import { 
  ManaliPlace, ManaliActivity, ManaliFood, ManaliPackingGuide, 
  ManaliWeatherTip, ManaliTravelTip, ManaliEmergencyContact, 
  ManaliTransport 
} from '@/types';

// PLACES
export function usePlaces(filters?: { category?: string; search?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['manaliPlaces', filters],
    queryFn: () => manaliApi.getPlaces(filters),
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManaliPlace>) => manaliApi.createPlace(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliPlaces'] }),
  });
}

export function useUpdatePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ManaliPlace> }) => manaliApi.updatePlace(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliPlaces'] }),
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => manaliApi.deletePlace(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliPlaces'] }),
  });
}

// ACTIVITIES
export function useActivities(filters?: { category?: string; search?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['manaliActivities', filters],
    queryFn: () => manaliApi.getActivities(filters),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManaliActivity>) => manaliApi.createActivity(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliActivities'] }),
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ManaliActivity> }) => manaliApi.updateActivity(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliActivities'] }),
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => manaliApi.deleteActivity(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliActivities'] }),
  });
}

// FOOD
export function useFoods(filters?: { category?: string; search?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['manaliFoods', filters],
    queryFn: () => manaliApi.getFoods(filters),
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManaliFood>) => manaliApi.createFood(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliFoods'] }),
  });
}

export function useUpdateFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ManaliFood> }) => manaliApi.updateFood(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliFoods'] }),
  });
}

export function useDeleteFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => manaliApi.deleteFood(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliFoods'] }),
  });
}

// PACKING GUIDES
export function usePackingGuides(season?: string) {
  return useQuery({
    queryKey: ['manaliPackingGuides', season],
    queryFn: () => manaliApi.getPackingGuides(season),
  });
}

export function useCreatePackingGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManaliPackingGuide>) => manaliApi.createPackingGuide(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliPackingGuides'] }),
  });
}

// WEATHER TIPS
export function useWeatherTips(season?: string) {
  return useQuery({
    queryKey: ['manaliWeatherTips', season],
    queryFn: () => manaliApi.getWeatherTips(season),
  });
}

export function useCreateWeatherTip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManaliWeatherTip>) => manaliApi.createWeatherTip(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliWeatherTips'] }),
  });
}

// TRAVEL TIPS
export function useTravelTips() {
  return useQuery({
    queryKey: ['manaliTravelTips'],
    queryFn: () => manaliApi.getTravelTips(),
  });
}

export function useCreateTravelTip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManaliTravelTip>) => manaliApi.createTravelTip(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliTravelTips'] }),
  });
}

// EMERGENCY CONTACTS
export function useEmergencyContacts() {
  return useQuery({
    queryKey: ['manaliEmergencyContacts'],
    queryFn: () => manaliApi.getEmergencyContacts(),
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManaliEmergencyContact>) => manaliApi.createEmergencyContact(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliEmergencyContacts'] }),
  });
}

// TRANSPORT
export function useTransport() {
  return useQuery({
    queryKey: ['manaliTransport'],
    queryFn: () => manaliApi.getTransport(),
  });
}

export function useCreateTransport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ManaliTransport>) => manaliApi.createTransport(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliTransport'] }),
  });
}

// FAVORITES
export function useFavorites() {
  return useQuery({
    queryKey: ['manaliFavorites'],
    queryFn: () => manaliApi.getFavorites(),
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemType, itemId }: { itemType: 'place' | 'activity' | 'food'; itemId: string }) => 
      manaliApi.addFavorite(itemType, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliFavorites'] }),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemType, itemId }: { itemType: 'place' | 'activity' | 'food'; itemId: string }) => 
      manaliApi.removeFavorite(itemType, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manaliFavorites'] }),
  });
}
