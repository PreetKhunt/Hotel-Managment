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
  created_at: string;
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
  created_at: string;
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
  created_at: string;
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
  created_at: string;
}

export interface ManaliWeatherTip {
  id: string;
  season: string;
  title: string;
  description: string;
  safety_tips: string | null;
  expected_conditions: string | null;
  recommended_items: string | null;
  created_at: string;
}

export interface ManaliTravelTip {
  id: string;
  title: string;
  description: string;
  category: string | null;
  priority: number;
  created_at: string;
}

export interface ManaliEmergencyContact {
  id: string;
  service_name: string;
  phone_number: string;
  description: string | null;
  category: string | null;
  display_order: number;
  created_at: string;
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
  created_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}
