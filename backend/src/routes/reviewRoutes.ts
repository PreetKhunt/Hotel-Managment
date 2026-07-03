import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviewController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.route('/')
  .get(asyncHandler(getReviews))
  .post(asyncHandler(createReview));

export default router;
