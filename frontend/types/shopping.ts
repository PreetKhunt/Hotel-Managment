export interface PartnerShop {
  id: string;
  shop_name: string;
  brand_name: string | null;
  category: string;
  owner_name: string | null;
  address: string;
  distance_from_hotel: number | null;
  opening_hours: string | null;
  google_maps_url: string | null;
  phone_number: string | null;
  description: string | null;
  images: string[] | null;
  created_at: string;
}

export interface PartnerOffer {
  id: string;
  shop_id: string;
  title: string;
  description: string;
  offer_type: string;
  discount_value: number;
  expiry_date: string;
  terms: string | null;
  max_redemptions: number;
  current_redemptions: number;
  created_at: string;
  shop_name?: string;
  brand_name?: string;
}

export type CouponStatus = 'generated' | 'redeemed' | 'expired' | 'cancelled';

export interface UserCoupon {
  id: string;
  coupon_code: string;
  user_id: string;
  offer_id: string;
  partner_shop_id: string;
  discount_snapshot: number;
  expiry_date: string;
  status: CouponStatus;
  generated_at: string;
  redeemed_at: string | null;
  created_at: string;
  offer_title?: string;
  shop_name?: string;
  brand_name?: string;
  offer_type?: string;
}

