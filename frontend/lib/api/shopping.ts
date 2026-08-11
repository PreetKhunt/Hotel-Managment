import api from '../api';
import { 
  PartnerShop, PartnerOffer, UserCoupon, PaginatedResult, CouponStatus 
} from '../../types';

export const shoppingApi = {
  // SHOPS
  getShops: async (filters?: { category?: string; search?: string; brand?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const response = await api.get<{ success: boolean; data: PartnerShop[]; total: number }>(`/shopping/shops?${params.toString()}`);
    return response.data;
  },
  getShopById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: PartnerShop }>(`/shopping/shops/${id}`);
    return response.data.data;
  },
  createShop: async (data: Partial<PartnerShop>) => {
    const response = await api.post<{ success: boolean; data: PartnerShop }>('/shopping/shops', data);
    return response.data.data;
  },
  updateShop: async (id: string, data: Partial<PartnerShop>) => {
    const response = await api.patch<{ success: boolean; data: PartnerShop }>(`/shopping/shops/${id}`, data);
    return response.data.data;
  },
  deleteShop: async (id: string) => {
    await api.delete(`/shopping/shops/${id}`);
  },

  // OFFERS
  getOffers: async (filters?: { shop_id?: string; active_only?: boolean; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.shop_id) params.append('shop_id', filters.shop_id);
    if (filters?.active_only !== undefined) params.append('active_only', filters.active_only.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const response = await api.get<{ success: boolean; data: PartnerOffer[]; total: number }>(`/shopping/offers?${params.toString()}`);
    return response.data;
  },
  getOfferById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: PartnerOffer }>(`/shopping/offers/${id}`);
    return response.data.data;
  },
  createOffer: async (data: Partial<PartnerOffer>) => {
    const response = await api.post<{ success: boolean; data: PartnerOffer }>('/shopping/offers', data);
    return response.data.data;
  },
  updateOffer: async (id: string, data: Partial<PartnerOffer>) => {
    const response = await api.patch<{ success: boolean; data: PartnerOffer }>(`/shopping/offers/${id}`, data);
    return response.data.data;
  },
  deleteOffer: async (id: string) => {
    await api.delete(`/shopping/offers/${id}`);
  },

  // COUPONS
  generateCoupon: async (offer_id: string) => {
    const response = await api.post<{ success: boolean; data: UserCoupon; message: string }>('/shopping/coupons/generate', { offer_id });
    return response.data;
  },
  redeemCoupon: async (coupon_code: string) => {
    const response = await api.post<{ success: boolean; data: UserCoupon; message: string }>('/shopping/coupons/redeem', { coupon_code });
    return response.data;
  },
  getMyCoupons: async (status?: CouponStatus) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const response = await api.get<{ success: boolean; data: UserCoupon[] }>(`/shopping/coupons/my-coupons?${params.toString()}`);
    return response.data.data;
  },
  cancelCoupon: async (id: string) => {
    const response = await api.post<{ success: boolean; data: UserCoupon; message: string }>(`/shopping/coupons/${id}/cancel`, {});
    return response.data;
  }
};
