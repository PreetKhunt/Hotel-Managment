import { Router } from 'express';
import { bookTreatment, getMySpaBookings, getAllSpaBookings, cancelSpaBooking, confirmSpaBooking } from '../controllers/spaController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

router.post('/book', authenticate, bookTreatment);
router.get('/my-bookings', authenticate, getMySpaBookings);
router.get('/all', authenticate, requirePermission('full_access'), getAllSpaBookings);
router.patch('/:id/cancel', authenticate, requirePermission('full_access'), cancelSpaBooking);
router.patch('/:id/confirm', authenticate, requirePermission('full_access'), confirmSpaBooking);

export default router;
