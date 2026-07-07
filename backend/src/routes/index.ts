import { Router } from 'express';
import userRoutes from './userRoutes';
import roomRoutes from './roomRoutes';
import bookingRoutes from './bookingRoutes';
import paymentRoutes from './paymentRoutes';
import reviewRoutes from './reviewRoutes';
import dashboardRoutes from './dashboardRoutes';
import healthRoutes from './healthRoutes';
import { HTTP_STATUS } from '../constants/httpStatuses';

const router = Router();

// Base health and root endpoints
router.get('/', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Hospitality Hub API v1 is active and ready.',
  });
});

// Mounted resource routers
router.use('/health', healthRoutes);

import availabilityRoutes from './availabilityRoutes';
import authRoutes from './authRoutes';
import hotelRoutes from './hotelRoutes';
import restaurantRoutes from './restaurantRoutes';
import spaRoutes from './spaRoutes';
import fitnessRoutes from './fitnessRoutes';

import superAdminRoutes from './superAdminRoutes';

// Mounted resource routers
router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/availability', availabilityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/spa', spaRoutes);
router.use('/fitness', fitnessRoutes);
router.use('/super-admin', superAdminRoutes);

export default router;
