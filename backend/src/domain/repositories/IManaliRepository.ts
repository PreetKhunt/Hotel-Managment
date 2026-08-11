import { PoolClient } from 'pg';

export interface ManaliPlace {
  id: string;
  name: string;
  category: string;
  description: string;
  distance_from_hotel: number | null;
  approximate_travel_time: string | null;
  opening_time: string | null;
  closing_time: string | null;
  entry_fee: number;
  google_maps_url: string | null;
  image: string | null;
  family_friendly: boolean;
  is_free_entry: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ManaliActivity {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string | null;
  approximate_cost: number;
  duration: string | null;
  distance_from_hotel: number | null;
  suitable_for: string | null;
  season: string | null;
  image: string | null;
  google_maps_url: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ManaliFood {
  id: string;
  name: string;
  description: string;
  recommended_restaurant: string | null;
  distance_from_hotel: number | null;
  approximate_cost: number;
  veg_non_veg: 'Veg' | 'Non-Veg' | 'Both' | null;
  category: string | null;
  image: string | null;
  google_maps_url: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ManaliPackingGuide {
  id: string;
  season: string;
  clothing: string | null;
  medicine: string | null;
  shoes: string | null;
  accessories: string | null;
  travel_essentials: string | null;
  additional_tips: string | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ManaliWeatherTip {
  id: string;
  season: string;
  title: string;
  description: string;
  safety_tips: string | null;
  expected_conditions: string | null;
  recommended_items: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ManaliTravelTip {
  id: string;
  title: string;
  description: string;
  category: string | null;
  priority: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ManaliEmergencyContact {
  id: string;
  service_name: string;
  phone_number: string;
  description: string | null;
  category: string | null;
  display_order: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ManaliTransport {
  id: string;
  transport_type: string;
  provider_name: string;
  description: string | null;
  distance_from_hotel: number | null;
  phone: string | null;
  opening_hours: string | null;
  google_maps_url: string | null;
  estimated_cost: number;
  image: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IManaliRepository {
  getPlaces(filters?: { category?: string; search?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<ManaliPlace>>;
  getPlaceById(id: string, client?: PoolClient): Promise<ManaliPlace | null>;
  createPlace(data: Partial<ManaliPlace>, client?: PoolClient): Promise<ManaliPlace>;
  updatePlace(id: string, data: Partial<ManaliPlace>, client?: PoolClient): Promise<ManaliPlace>;
  deletePlace(id: string, client?: PoolClient): Promise<void>;

  getActivities(filters?: { category?: string; search?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<ManaliActivity>>;
  getActivityById(id: string, client?: PoolClient): Promise<ManaliActivity | null>;
  createActivity(data: Partial<ManaliActivity>, client?: PoolClient): Promise<ManaliActivity>;
  updateActivity(id: string, data: Partial<ManaliActivity>, client?: PoolClient): Promise<ManaliActivity>;
  deleteActivity(id: string, client?: PoolClient): Promise<void>;

  getFoods(filters?: { category?: string; search?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<ManaliFood>>;
  getFoodById(id: string, client?: PoolClient): Promise<ManaliFood | null>;
  createFood(data: Partial<ManaliFood>, client?: PoolClient): Promise<ManaliFood>;
  updateFood(id: string, data: Partial<ManaliFood>, client?: PoolClient): Promise<ManaliFood>;
  deleteFood(id: string, client?: PoolClient): Promise<void>;

  getPackingGuides(season?: string, client?: PoolClient): Promise<ManaliPackingGuide[]>;
  createPackingGuide(data: Partial<ManaliPackingGuide>, client?: PoolClient): Promise<ManaliPackingGuide>;
  updatePackingGuide(id: string, data: Partial<ManaliPackingGuide>, client?: PoolClient): Promise<ManaliPackingGuide>;
  deletePackingGuide(id: string, client?: PoolClient): Promise<void>;

  getWeatherTips(season?: string, client?: PoolClient): Promise<ManaliWeatherTip[]>;
  createWeatherTip(data: Partial<ManaliWeatherTip>, client?: PoolClient): Promise<ManaliWeatherTip>;
  updateWeatherTip(id: string, data: Partial<ManaliWeatherTip>, client?: PoolClient): Promise<ManaliWeatherTip>;
  deleteWeatherTip(id: string, client?: PoolClient): Promise<void>;

  getTravelTips(client?: PoolClient): Promise<ManaliTravelTip[]>;
  createTravelTip(data: Partial<ManaliTravelTip>, client?: PoolClient): Promise<ManaliTravelTip>;
  updateTravelTip(id: string, data: Partial<ManaliTravelTip>, client?: PoolClient): Promise<ManaliTravelTip>;
  deleteTravelTip(id: string, client?: PoolClient): Promise<void>;

  getEmergencyContacts(client?: PoolClient): Promise<ManaliEmergencyContact[]>;
  createEmergencyContact(data: Partial<ManaliEmergencyContact>, client?: PoolClient): Promise<ManaliEmergencyContact>;
  updateEmergencyContact(id: string, data: Partial<ManaliEmergencyContact>, client?: PoolClient): Promise<ManaliEmergencyContact>;
  deleteEmergencyContact(id: string, client?: PoolClient): Promise<void>;

  getTransport(client?: PoolClient): Promise<ManaliTransport[]>;
  createTransport(data: Partial<ManaliTransport>, client?: PoolClient): Promise<ManaliTransport>;
  updateTransport(id: string, data: Partial<ManaliTransport>, client?: PoolClient): Promise<ManaliTransport>;
  deleteTransport(id: string, client?: PoolClient): Promise<void>;
  
  // Favorites
  addFavorite(userId: string, itemType: 'place' | 'activity' | 'food', itemId: string, client?: PoolClient): Promise<void>;
  removeFavorite(userId: string, itemType: 'place' | 'activity' | 'food', itemId: string, client?: PoolClient): Promise<void>;
  getFavorites(userId: string, client?: PoolClient): Promise<{ places: string[], activities: string[], foods: string[] }>;
}
