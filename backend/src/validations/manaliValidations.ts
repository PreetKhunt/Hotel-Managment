import { z } from 'zod';

export const manaliPlaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  distance_from_hotel: z.number().nullable().optional(),
  approximate_travel_time: z.string().nullable().optional(),
  opening_time: z.string().nullable().optional(),
  closing_time: z.string().nullable().optional(),
  entry_fee: z.number().min(0).optional(),
  google_maps_url: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  family_friendly: z.boolean().optional(),
  is_free_entry: z.boolean().optional(),
});

export const manaliActivitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.string().nullable().optional(),
  approximate_cost: z.number().min(0).optional(),
  duration: z.string().nullable().optional(),
  distance_from_hotel: z.number().nullable().optional(),
  suitable_for: z.string().nullable().optional(),
  season: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  google_maps_url: z.string().nullable().optional(),
});

export const manaliFoodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  recommended_restaurant: z.string().nullable().optional(),
  distance_from_hotel: z.number().nullable().optional(),
  approximate_cost: z.number().min(0).optional(),
  veg_non_veg: z.enum(['Veg', 'Non-Veg', 'Both']).nullable().optional(),
  category: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  google_maps_url: z.string().nullable().optional(),
});

export const manaliPackingGuideSchema = z.object({
  season: z.string().min(1, 'Season is required'),
  clothing: z.string().nullable().optional(),
  medicine: z.string().nullable().optional(),
  shoes: z.string().nullable().optional(),
  accessories: z.string().nullable().optional(),
  travel_essentials: z.string().nullable().optional(),
  additional_tips: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export const manaliWeatherTipSchema = z.object({
  season: z.string().min(1, 'Season is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  safety_tips: z.string().nullable().optional(),
  expected_conditions: z.string().nullable().optional(),
  recommended_items: z.string().nullable().optional(),
});

export const manaliTravelTipSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().nullable().optional(),
  priority: z.number().default(0),
});

export const manaliEmergencyContactSchema = z.object({
  service_name: z.string().min(1, 'Service name is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  display_order: z.number().default(0),
});

export const manaliTransportSchema = z.object({
  transport_type: z.string().min(1, 'Transport type is required'),
  provider_name: z.string().min(1, 'Provider name is required'),
  description: z.string().nullable().optional(),
  distance_from_hotel: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  opening_hours: z.string().nullable().optional(),
  google_maps_url: z.string().nullable().optional(),
  estimated_cost: z.number().min(0).optional(),
  image: z.string().nullable().optional(),
});

// Update schemas can just be partials
export const updateManaliPlaceSchema = manaliPlaceSchema.partial();
export const updateManaliActivitySchema = manaliActivitySchema.partial();
export const updateManaliFoodSchema = manaliFoodSchema.partial();
export const updateManaliPackingGuideSchema = manaliPackingGuideSchema.partial();
export const updateManaliWeatherTipSchema = manaliWeatherTipSchema.partial();
export const updateManaliTravelTipSchema = manaliTravelTipSchema.partial();
export const updateManaliEmergencyContactSchema = manaliEmergencyContactSchema.partial();
export const updateManaliTransportSchema = manaliTransportSchema.partial();
