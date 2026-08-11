import { PoolClient } from 'pg';

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
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface PartnerOffer {
  id: string;
  shop_id: string;
  title: string;
  description: string;
  offer_type: string;
  discount_value: number;
  expiry_date: Date;
  terms: string | null;
  max_redemptions: number;
  current_redemptions: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  // join
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
  expiry_date: Date;
  status: CouponStatus;
  generated_at: Date;
  redeemed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  // joins
  offer_title?: string;
  shop_name?: string;
  brand_name?: string;
  offer_type?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IShoppingRepository {
  // Shops
  getShops(filters?: { category?: string; search?: string; brand?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<PartnerShop>>;
  getShopById(id: string, client?: PoolClient): Promise<PartnerShop | null>;
  createShop(data: Partial<PartnerShop>, client?: PoolClient): Promise<PartnerShop>;
  updateShop(id: string, data: Partial<PartnerShop>, client?: PoolClient): Promise<PartnerShop>;
  deleteShop(id: string, client?: PoolClient): Promise<void>;

  // Offers
  getOffers(filters?: { shop_id?: string; active_only?: boolean; limit?: number; offset?: number }, client?: PoolClient): Promise<PaginatedResult<PartnerOffer>>;
  getOfferById(id: string, client?: PoolClient): Promise<PartnerOffer | null>;
  createOffer(data: Partial<PartnerOffer>, client?: PoolClient): Promise<PartnerOffer>;
  updateOffer(id: string, data: Partial<PartnerOffer>, client?: PoolClient): Promise<PartnerOffer>;
  deleteOffer(id: string, client?: PoolClient): Promise<void>;

  // Coupons
  generateCoupon(data: { user_id: string; offer_id: string; partner_shop_id: string; discount_snapshot: number; expiry_date: Date; coupon_code: string }, client?: PoolClient): Promise<UserCoupon>;
  redeemCouponAtomic(coupon_code: string, user_id: string, client?: PoolClient): Promise<UserCoupon>;
  getCouponsByUser(userId: string, filters?: { status?: CouponStatus }, client?: PoolClient): Promise<UserCoupon[]>;
  getCouponByCode(coupon_code: string, client?: PoolClient): Promise<UserCoupon | null>;
  cancelCoupon(id: string, client?: PoolClient): Promise<UserCoupon>;
}
