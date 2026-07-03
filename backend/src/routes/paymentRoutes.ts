import { Router } from 'express';
import { getPayments, createPayment, verifyPayment } from '../controllers/paymentController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.route('/')
  .get(asyncHandler(getPayments))
  .post(asyncHandler(createPayment));

router.post('/verify', asyncHandler(verifyPayment));

export default router;
