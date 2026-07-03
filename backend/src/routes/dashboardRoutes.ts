import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.route('/')
  .get(asyncHandler(getDashboardStats));

export default router;
