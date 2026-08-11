import api from '../api';
import { 
  ManaliPlace, ManaliActivity, ManaliFood, ManaliPackingGuide, 
  ManaliWeatherTip, ManaliTravelTip, ManaliEmergencyContact, 
  ManaliTransport, PaginatedResult 
} from '../../types/manali';

export const manaliApi = {
  // PLACES
  getPlaces: async (filters?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const response = await api.get<{ success: boolean; data: ManaliPlace[]; total: number }>(`/manali/places?${params.toString()}`);
    return response.data;
  },
  getPlaceById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: ManaliPlace }>(`/manali/places/${id}`);
    return response.data.data;
  },
  createPlace: async (data: Partial<ManaliPlace>) => {
    const response = await api.post<{ success: boolean; data: ManaliPlace }>('/manali/places', data);
    return response.data.data;
  },
  updatePlace: async (id: string, data: Partial<ManaliPlace>) => {
    const response = await api.patch<{ success: boolean; data: ManaliPlace }>(`/manali/places/${id}`, data);
    return response.data.data;
  },
  deletePlace: async (id: string) => {
    await api.delete(`/manali/places/${id}`);
  },

  // ACTIVITIES
  getActivities: async (filters?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const response = await api.get<{ success: boolean; data: ManaliActivity[]; total: number }>(`/manali/activities?${params.toString()}`);
    return response.data;
  },
  getActivityById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: ManaliActivity }>(`/manali/activities/${id}`);
    return response.data.data;
  },
  createActivity: async (data: Partial<ManaliActivity>) => {
    const response = await api.post<{ success: boolean; data: ManaliActivity }>('/manali/activities', data);
    return response.data.data;
  },
  updateActivity: async (id: string, data: Partial<ManaliActivity>) => {
    const response = await api.patch<{ success: boolean; data: ManaliActivity }>(`/manali/activities/${id}`, data);
    return response.data.data;
  },
  deleteActivity: async (id: string) => {
    await api.delete(`/manali/activities/${id}`);
  },

  // FOOD
  getFoods: async (filters?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const response = await api.get<{ success: boolean; data: ManaliFood[]; total: number }>(`/manali/food?${params.toString()}`);
    return response.data;
  },
  getFoodById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: ManaliFood }>(`/manali/food/${id}`);
    return response.data.data;
  },
  createFood: async (data: Partial<ManaliFood>) => {
    const response = await api.post<{ success: boolean; data: ManaliFood }>('/manali/food', data);
    return response.data.data;
  },
  updateFood: async (id: string, data: Partial<ManaliFood>) => {
    const response = await api.patch<{ success: boolean; data: ManaliFood }>(`/manali/food/${id}`, data);
    return response.data.data;
  },
  deleteFood: async (id: string) => {
    await api.delete(`/manali/food/${id}`);
  },

  // PACKING GUIDES
  getPackingGuides: async (season?: string) => {
    const response = await api.get<{ success: boolean; data: ManaliPackingGuide[] }>(`/manali/packing-guides${season ? `?season=${season}` : ''}`);
    return response.data.data;
  },
  createPackingGuide: async (data: Partial<ManaliPackingGuide>) => {
    const response = await api.post<{ success: boolean; data: ManaliPackingGuide }>('/manali/packing-guides', data);
    return response.data.data;
  },
  updatePackingGuide: async (id: string, data: Partial<ManaliPackingGuide>) => {
    const response = await api.patch<{ success: boolean; data: ManaliPackingGuide }>(`/manali/packing-guides/${id}`, data);
    return response.data.data;
  },
  deletePackingGuide: async (id: string) => {
    await api.delete(`/manali/packing-guides/${id}`);
  },

  // WEATHER TIPS
  getWeatherTips: async (season?: string) => {
    const response = await api.get<{ success: boolean; data: ManaliWeatherTip[] }>(`/manali/weather-tips${season ? `?season=${season}` : ''}`);
    return response.data.data;
  },
  createWeatherTip: async (data: Partial<ManaliWeatherTip>) => {
    const response = await api.post<{ success: boolean; data: ManaliWeatherTip }>('/manali/weather-tips', data);
    return response.data.data;
  },
  updateWeatherTip: async (id: string, data: Partial<ManaliWeatherTip>) => {
    const response = await api.patch<{ success: boolean; data: ManaliWeatherTip }>(`/manali/weather-tips/${id}`, data);
    return response.data.data;
  },
  deleteWeatherTip: async (id: string) => {
    await api.delete(`/manali/weather-tips/${id}`);
  },

  // TRAVEL TIPS
  getTravelTips: async () => {
    const response = await api.get<{ success: boolean; data: ManaliTravelTip[] }>('/manali/travel-tips');
    return response.data.data;
  },
  createTravelTip: async (data: Partial<ManaliTravelTip>) => {
    const response = await api.post<{ success: boolean; data: ManaliTravelTip }>('/manali/travel-tips', data);
    return response.data.data;
  },
  updateTravelTip: async (id: string, data: Partial<ManaliTravelTip>) => {
    const response = await api.patch<{ success: boolean; data: ManaliTravelTip }>(`/manali/travel-tips/${id}`, data);
    return response.data.data;
  },
  deleteTravelTip: async (id: string) => {
    await api.delete(`/manali/travel-tips/${id}`);
  },

  // EMERGENCY CONTACTS
  getEmergencyContacts: async () => {
    const response = await api.get<{ success: boolean; data: ManaliEmergencyContact[] }>('/manali/emergency-contacts');
    return response.data.data;
  },
  createEmergencyContact: async (data: Partial<ManaliEmergencyContact>) => {
    const response = await api.post<{ success: boolean; data: ManaliEmergencyContact }>('/manali/emergency-contacts', data);
    return response.data.data;
  },
  updateEmergencyContact: async (id: string, data: Partial<ManaliEmergencyContact>) => {
    const response = await api.patch<{ success: boolean; data: ManaliEmergencyContact }>(`/manali/emergency-contacts/${id}`, data);
    return response.data.data;
  },
  deleteEmergencyContact: async (id: string) => {
    await api.delete(`/manali/emergency-contacts/${id}`);
  },

  // TRANSPORT
  getTransport: async () => {
    const response = await api.get<{ success: boolean; data: ManaliTransport[] }>('/manali/transport');
    return response.data.data;
  },
  createTransport: async (data: Partial<ManaliTransport>) => {
    const response = await api.post<{ success: boolean; data: ManaliTransport }>('/manali/transport', data);
    return response.data.data;
  },
  updateTransport: async (id: string, data: Partial<ManaliTransport>) => {
    const response = await api.patch<{ success: boolean; data: ManaliTransport }>(`/manali/transport/${id}`, data);
    return response.data.data;
  },
  deleteTransport: async (id: string) => {
    await api.delete(`/manali/transport/${id}`);
  },

  // FAVORITES
  getFavorites: async () => {
    const response = await api.get<{ success: boolean; data: { places: string[], activities: string[], foods: string[] } }>('/manali/favorites');
    return response.data.data;
  },
  addFavorite: async (itemType: 'place' | 'activity' | 'food', itemId: string) => {
    await api.post('/manali/favorites', { itemType, itemId });
  },
  removeFavorite: async (itemType: 'place' | 'activity' | 'food', itemId: string) => {
    await api.delete(`/manali/favorites/${itemType}/${itemId}`);
  },
};
