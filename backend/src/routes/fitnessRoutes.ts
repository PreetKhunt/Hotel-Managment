import { Router } from 'express';
import { supabase } from '../config/supabase';
import { FitnessRepository } from '../domain/repositories/postgres/FitnessRepository';
import { FitnessService } from '../services/FitnessService';
import { FitnessController } from '../controllers/fitnessController';
import { authenticate, requirePermission } from '../middleware/auth';

const fitnessRepo = new FitnessRepository(supabase);
const fitnessService = new FitnessService(fitnessRepo);
const fitnessController = new FitnessController(fitnessService);

const router = Router();

router.post('/book', authenticate, fitnessController.bookFitness);
router.get('/my-bookings', authenticate, fitnessController.getMyBookings);

// Admin routes
router.get('/all', authenticate, requirePermission('full_access'), fitnessController.getAllBookings);
router.patch('/:id/status', authenticate, requirePermission('full_access'), fitnessController.updateBookingStatus);
router.delete('/:id', authenticate, requirePermission('full_access'), fitnessController.deleteBooking);

export default router;
