import { Router } from 'express';
import { getCalendar } from '../controllers/availabilityController';

const router = Router();

// GET /api/v1/availability/calendar
router.get('/calendar', getCalendar);

export default router;
