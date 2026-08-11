import { z } from 'zod';

export const partnerShopSchema = z.object({
  shop_name: z.string().min(1, 'Shop name is required'),
  brand_name: z.string().nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  owner_name: z.string().nullable().optional(),
  address: z.string().min(1, 'Address is required'),
  distance_from_hotel: z.number().nullable().optional(),
  opening_hours: z.string().nullable().optional(),
  google_maps_url: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  images: z.array(z.string()).nullable().optional(),
});

export const updatePartnerShopSchema = partnerShopSchema.partial();

export const partnerOfferSchema = z.object({
  shop_id: z.string().uuid('Invalid shop ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  offer_type: z.string().min(1, 'Offer type is required'),
  discount_value: z.number().min(0, 'Discount must be positive'),
  expiry_date: z.string().or(z.date()).refine(val => new Date(val) > new Date(), 'Expiry date must be in the future'),
  terms: z.string().nullable().optional(),
  max_redemptions: z.number().min(0).default(0),
});

export const updatePartnerOfferSchema = partnerOfferSchema.partial();

export const generateCouponSchema = z.object({
  offer_id: z.string().uuid('Invalid offer ID'),
});

export const redeemCouponSchema = z.object({
  coupon_code: z.string().min(1, 'Coupon code is required'),
});
