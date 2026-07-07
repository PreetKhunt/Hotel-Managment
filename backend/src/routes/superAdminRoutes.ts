import { Router } from 'express';
import { requireSuperAdmin } from '../middleware/authMiddleware';
import { authenticate } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { DashboardController } from '../controllers/superAdmin/DashboardController';

import { SuperAdminController } from '../controllers/superAdmin/SuperAdminController';
import { AdminAuditLogService } from '../services/superAdmin/AdminAuditLogService';
import { updateRoomStatusSchema, updateBookingStatusSchema, updateUserRoleSchema, updateUserStatusSchema, updateHotelSettingsSchema } from '../validations/superAdminValidations';
import { validateRequest } from '../middleware/validationHandler';

const router = Router();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const dashboardController = new DashboardController(supabase);
const auditLogService = new AdminAuditLogService(supabase);
const superAdminController = new SuperAdminController(supabase, auditLogService);

// Authenticate user and inject req.user
router.use(authenticate);

// ALL routes below this middleware require SUPER_ADMIN permission
router.use(requireSuperAdmin());

// Dashboard
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// Rooms
router.get('/rooms', superAdminController.getRooms);
router.post('/rooms', superAdminController.createRoom);
router.put('/rooms/:id', superAdminController.updateRoom);
router.patch('/rooms/:id/status', validateRequest(updateRoomStatusSchema), superAdminController.updateRoom);
router.delete('/rooms/:id', superAdminController.deleteRoom);

// Bookings
router.get('/bookings', superAdminController.getBookings);
router.patch('/bookings/:id/status', validateRequest(updateBookingStatusSchema), superAdminController.updateBookingStatus);

// Users
router.get('/users', superAdminController.getUsers);
router.patch('/users/:id/role', validateRequest(updateUserRoleSchema), superAdminController.updateUser);
router.patch('/users/:id/status', validateRequest(updateUserStatusSchema), superAdminController.updateUser);

// Reviews
router.get('/reviews', superAdminController.getReviews);
router.patch('/reviews/:id/visibility', superAdminController.updateReviewStatus);

// Settings
router.get('/settings', superAdminController.getSettings);
router.put('/settings', validateRequest(updateHotelSettingsSchema), superAdminController.updateSettings);

// Logs
router.get('/logs', superAdminController.getAuditLogs);

export default router;
