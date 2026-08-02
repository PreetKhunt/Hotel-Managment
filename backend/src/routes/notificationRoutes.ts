import { Router } from 'express';
import { pgPool as pool } from '../config/database';
import { NotificationRepository } from '../domain/repositories/postgres/NotificationRepository';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const notifRepo = new NotificationRepository(pool);
const notifController = new NotificationController(notifRepo);

const router = Router();

router.use(authenticate);

// All authenticated users can fetch their own and role-targeted system notifications
router.get('/', notifController.getMyNotifications);
router.patch('/:id/read', notifController.markAsRead);
router.patch('/mark-all-read', notifController.markAllAsRead);

export default router;
