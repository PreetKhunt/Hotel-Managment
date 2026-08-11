import { IShoppingRepository, PartnerShop, PartnerOffer, UserCoupon, PaginatedResult, CouponStatus } from '../domain/repositories/IShoppingRepository';
import { INotificationRepository, NotificationPriority } from '../domain/repositories/INotificationRepository';

export class ShoppingService {
  constructor(
     
    private shoppingRepo: IShoppingRepository,
    private notificationRepo: INotificationRepository
  ) {}

  // SHOPS
  async getShops(filters?: { category?: string; search?: string; brand?: string; limit?: number; offset?: number }): Promise<PaginatedResult<PartnerShop>> {
    return this.shoppingRepo.getShops(filters);
  }

  async getShopById(id: string): Promise<PartnerShop | null> {
    return this.shoppingRepo.getShopById(id);
  }

  async createShop(data: Partial<PartnerShop>): Promise<PartnerShop> {
    return this.shoppingRepo.createShop(data);
  }

  async updateShop(id: string, data: Partial<PartnerShop>): Promise<PartnerShop> {
    return this.shoppingRepo.updateShop(id, data);
  }

  async deleteShop(id: string): Promise<void> {
    return this.shoppingRepo.deleteShop(id);
  }

  // OFFERS
  async getOffers(filters?: { shop_id?: string; active_only?: boolean; limit?: number; offset?: number }): Promise<PaginatedResult<PartnerOffer>> {
    return this.shoppingRepo.getOffers(filters);
  }

  async getOfferById(id: string): Promise<PartnerOffer | null> {
    return this.shoppingRepo.getOfferById(id);
  }

  async createOffer(data: Partial<PartnerOffer>): Promise<PartnerOffer> {
    return this.shoppingRepo.createOffer(data);
  }

  async updateOffer(id: string, data: Partial<PartnerOffer>): Promise<PartnerOffer> {
    return this.shoppingRepo.updateOffer(id, data);
  }

  async deleteOffer(id: string): Promise<void> {
    return this.shoppingRepo.deleteOffer(id);
  }

  // COUPONS
  async generateCoupon(userId: string, offerId: string): Promise<UserCoupon> {
    const offer = await this.shoppingRepo.getOfferById(offerId);
    if (!offer) throw new Error('Offer not found');
    if (offer.expiry_date.getTime() < Date.now()) throw new Error('Offer has expired');
    
    // Generate a unique 8-character alphanumeric code
    const coupon_code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const coupon = await this.shoppingRepo.generateCoupon({
      user_id: userId,
      offer_id: offer.id,
      partner_shop_id: offer.shop_id,
      discount_snapshot: offer.discount_value,
      expiry_date: offer.expiry_date,
      coupon_code
    });

    // Notify user
    await this.notificationRepo.createNotification({
      recipient_id: userId,
      title: 'New Coupon Generated!',
      message: `You have successfully claimed a coupon for ${offer.title} at ${offer.shop_name || 'a partner shop'}.`,
      priority: NotificationPriority.INFO,
      link: '/dashboard/shopping/my-coupons'
    });

    return coupon;
  }

  async redeemCoupon(couponCode: string, userId: string): Promise<UserCoupon> {
    const coupon = await this.shoppingRepo.redeemCouponAtomic(couponCode, userId);
    
    // Notify user
    await this.notificationRepo.createNotification({
      recipient_id: userId,
      title: 'Coupon Redeemed successfully',
      message: `Your coupon ${couponCode} has been successfully redeemed.`,
      priority: NotificationPriority.INFO,
      link: '/dashboard/shopping/my-coupons'
    });

    return coupon;
  }

  async getCouponsByUser(userId: string, filters?: { status?: CouponStatus }): Promise<UserCoupon[]> {
    return this.shoppingRepo.getCouponsByUser(userId, filters);
  }

  async getCouponByCode(coupon_code: string): Promise<UserCoupon | null> {
    return this.shoppingRepo.getCouponByCode(coupon_code);
  }

  async cancelCoupon(id: string): Promise<UserCoupon> {
    return this.shoppingRepo.cancelCoupon(id);
  }
}
