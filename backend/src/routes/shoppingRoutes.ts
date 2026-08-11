import { Router } from 'express';
import { ShoppingController } from '../controllers/shoppingController';
import { ShoppingService } from '../services/ShoppingService';
import { ShoppingRepository } from '../domain/repositories/postgres/ShoppingRepository';
import { NotificationRepository } from '../domain/repositories/postgres/NotificationRepository';
import { pgPool as pool } from '../config/database';
import { authenticate, requirePermission } from '../middleware/auth';
import { validateRequest } from '../middleware/validationHandler';
import {
  partnerShopSchema, updatePartnerShopSchema,
  partnerOfferSchema, updatePartnerOfferSchema,
  generateCouponSchema, redeemCouponSchema
} from '../validations/shoppingValidations';

const router = Router();
const shoppingRepo = new ShoppingRepository(pool);
const notifRepo = new NotificationRepository(pool);
const shoppingService = new ShoppingService(shoppingRepo, notifRepo);
const shoppingController = new ShoppingController(shoppingService);

// ----------------------------------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------------------------------
router.get('/shops', shoppingController.getShops);
router.get('/shops/:id', shoppingController.getShopById);

router.get('/offers', shoppingController.getOffers);
router.get('/offers/:id', shoppingController.getOfferById);

// ----------------------------------------------------------------------------
// AUTHENTICATED USER ROUTES (Coupons)
// ----------------------------------------------------------------------------
router.use('/coupons', authenticate);
router.post('/coupons/generate', validateRequest(generateCouponSchema), shoppingController.generateCoupon);
router.post('/coupons/redeem', validateRequest(redeemCouponSchema), shoppingController.redeemCoupon);
router.get('/coupons/my-coupons', shoppingController.getMyCoupons);

// ----------------------------------------------------------------------------
// ADMIN ROUTES (CRUD)
// ----------------------------------------------------------------------------
router.use(authenticate);
router.use(requirePermission('full_access'));

router.post('/shops', validateRequest(partnerShopSchema), shoppingController.createShop);
router.patch('/shops/:id', validateRequest(updatePartnerShopSchema), shoppingController.updateShop);
router.delete('/shops/:id', shoppingController.deleteShop);

router.post('/offers', validateRequest(partnerOfferSchema), shoppingController.createOffer);
router.patch('/offers/:id', validateRequest(updatePartnerOfferSchema), shoppingController.updateOffer);
router.delete('/offers/:id', shoppingController.deleteOffer);

router.post('/coupons/:id/cancel', shoppingController.cancelCoupon);

export default router;
