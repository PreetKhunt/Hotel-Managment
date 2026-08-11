import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingApi } from '../lib/api/shopping';
import { PartnerShop, PartnerOffer, CouponStatus } from '@/types';

// SHOPS
export function useShops(filters?: { category?: string; search?: string; brand?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['partnerShops', filters],
    queryFn: () => shoppingApi.getShops(filters),
  });
}

export function useCreateShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PartnerShop>) => shoppingApi.createShop(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerShops'] }),
  });
}

export function useUpdateShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PartnerShop> }) => shoppingApi.updateShop(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerShops'] }),
  });
}

export function useDeleteShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shoppingApi.deleteShop(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerShops'] }),
  });
}

// OFFERS
export function useOffers(filters?: { shop_id?: string; active_only?: boolean; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['partnerOffers', filters],
    queryFn: () => shoppingApi.getOffers(filters),
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PartnerOffer>) => shoppingApi.createOffer(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerOffers'] }),
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PartnerOffer> }) => shoppingApi.updateOffer(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerOffers'] }),
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shoppingApi.deleteOffer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerOffers'] }),
  });
}

// COUPONS
export function useMyCoupons(status?: CouponStatus) {
  return useQuery({
    queryKey: ['myCoupons', status],
    queryFn: () => shoppingApi.getMyCoupons(status),
  });
}

export function useGenerateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offer_id: string) => shoppingApi.generateCoupon(offer_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCoupons'] }),
  });
}

export function useRedeemCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (coupon_code: string) => shoppingApi.redeemCoupon(coupon_code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCoupons'] }),
  });
}
