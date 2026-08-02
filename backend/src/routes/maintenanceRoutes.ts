import { Router, Request, Response, NextFunction } from 'express';
import { pgPool as pool } from '../config/database';
import { MaintenanceRepository } from '../domain/repositories/postgres/MaintenanceRepository';
import { NotificationRepository } from '../domain/repositories/postgres/NotificationRepository';
import { MaintenanceService } from '../services/MaintenanceService';
import { MaintenanceController } from '../controllers/maintenanceController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validationHandler';
import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema,
  filterMaintenanceHistorySchema
} from '../validations/maintenanceValidations';

const maintRepo = new MaintenanceRepository(pool);
const notifRepo = new NotificationRepository(pool);
const maintService = new MaintenanceService(pool, maintRepo, notifRepo);
const maintController = new MaintenanceController(maintService);

const router = Router();

const allowRoles = (allowed: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    if (user.permissions.includes('full_access') || user.permissions.includes('SUPER_ADMIN') || user.roleName === 'Admin' || user.roleName === 'Super Admin' || user.roleName === 'Reception') {
      next();
      return;
    }
    if (user.roleName && allowed.includes(user.roleName)) {
      next();
      return;
    }
    res.status(403).json({ success: false, message: 'Access denied: insufficient technical staff role permissions' });
    return;
  };
};

router.use(authenticate);

// Analytics, MTTR & Repair Cost Reports
router.get('/analytics', allowRoles(['Technician']), maintController.getDashboardAnalytics);

// Maintenance Requests & Workflow Management
router.get('/requests', allowRoles(['Technician', 'Housekeeping']), maintController.getRequests);
router.get('/requests/:id', allowRoles(['Technician', 'Housekeeping']), maintController.getRequestById);
// Any authenticated staff (including Housekeeping during cleaning inspection) can raise a repair ticket!
router.post('/requests', allowRoles(['Technician', 'Housekeeping', 'Staff']), validateRequest(createMaintenanceRequestSchema), maintController.createRequest);
router.patch('/requests/:id/status', allowRoles(['Technician']), validateRequest(updateMaintenanceRequestSchema), maintController.updateRequest);
router.delete('/requests/:id', allowRoles([]), maintController.deleteRequest); // Admins & Reception only

// Audit Logs (Full mutation, pricing, and timing history)
router.get('/audit-logs', allowRoles(['Technician']), validateRequest(filterMaintenanceHistorySchema), maintController.getAuditLogs);

export default router;
