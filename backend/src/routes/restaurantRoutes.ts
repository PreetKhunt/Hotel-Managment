import { Router } from 'express';
import { reserveTable, getMyReservations, getAllReservations, cancelRestaurantReservation } from '../controllers/restaurantController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.post('/reserve', authenticate, reserveTable);
router.get('/my-reservations', authenticate, getMyReservations);
router.get('/all', authenticate, requirePermission('full_access'), getAllReservations);
router.patch('/:id/cancel', authenticate, requirePermission('full_access'), cancelRestaurantReservation);

export default router;
