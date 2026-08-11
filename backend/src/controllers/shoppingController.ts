import { Request, Response, NextFunction } from 'express';
import { ShoppingService } from '../services/ShoppingService';
import { AppError, ErrorCode } from '../utils/AppError';
import { CouponStatus } from '../domain/repositories/IShoppingRepository';

export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  // SHOPS
  public getShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, search, brand, limit, offset } = req.query;
      const result = await this.shoppingService.getShops({
        category: category as string,
        brand: brand as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.status(200).json({ success: true, data: result.data, total: result.total });
    } catch (error) {
      next(error);
    }
  };

  public getShopById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shop = await this.shoppingService.getShopById(req.params.id);
      if (!shop) throw new AppError('Not found', 404, ErrorCode.NOT_FOUND);
      res.status(200).json({ success: true, data: shop });
    } catch (error) {
      next(error);
    }
  };

  public createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shop = await this.shoppingService.createShop(req.body);
      res.status(201).json({ success: true, data: shop, message: 'Shop created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shop = await this.shoppingService.updateShop(req.params.id, req.body);
      res.status(200).json({ success: true, data: shop, message: 'Shop updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deleteShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.shoppingService.deleteShop(req.params.id);
      res.status(200).json({ success: true, message: 'Shop deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // OFFERS
  public getOffers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shop_id, active_only, limit, offset } = req.query;
      const result = await this.shoppingService.getOffers({
        shop_id: shop_id as string,
        active_only: active_only === 'true',
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.status(200).json({ success: true, data: result.data, total: result.total });
    } catch (error) {
      next(error);
    }
  };

  public getOfferById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offer = await this.shoppingService.getOfferById(req.params.id);
      if (!offer) throw new AppError('Not found', 404, ErrorCode.NOT_FOUND);
      res.status(200).json({ success: true, data: offer });
    } catch (error) {
      next(error);
    }
  };

  public createOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offer = await this.shoppingService.createOffer(req.body);
      res.status(201).json({ success: true, data: offer, message: 'Offer created successfully' });
    } catch (error) {
      next(error);
    }
  };

  public updateOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const offer = await this.shoppingService.updateOffer(req.params.id, req.body);
      res.status(200).json({ success: true, data: offer, message: 'Offer updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.shoppingService.deleteOffer(req.params.id);
      res.status(200).json({ success: true, message: 'Offer deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // COUPONS
  public generateCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { offer_id } = req.body;
      const coupon = await this.shoppingService.generateCoupon(user.id, offer_id);
      
      res.status(201).json({ success: true, data: coupon, message: 'Coupon generated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public redeemCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { coupon_code } = req.body;
      const coupon = await this.shoppingService.redeemCoupon(coupon_code, user.id);
      
      res.status(200).json({ success: true, data: coupon, message: 'Coupon redeemed successfully' });
    } catch (error) {
      next(error);
    }
  };

  public getMyCoupons = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const status = req.query.status as string;
      const coupons = await this.shoppingService.getCouponsByUser(user.id, { status: status as CouponStatus });
      
      res.status(200).json({ success: true, data: coupons });
    } catch (error) {
      next(error);
    }
  };

  public cancelCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);
      
      // Admin override might be needed, but for now we'll just expose cancelling own coupons or admin cancelling any.
      // Assuming admins call this.
      const coupon = await this.shoppingService.cancelCoupon(req.params.id);
      res.status(200).json({ success: true, data: coupon, message: 'Coupon cancelled' });
    } catch (error) {
      next(error);
    }
  };
}
