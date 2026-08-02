import { Router, Request, Response, NextFunction } from 'express';
import { pgPool as pool } from '../config/database';
import { HousekeepingRepository } from '../domain/repositories/postgres/HousekeepingRepository';
import { NotificationRepository } from '../domain/repositories/postgres/NotificationRepository';
import { HousekeepingService } from '../services/HousekeepingService';
import { HousekeepingController } from '../controllers/housekeepingController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validationHandler';
import {
  createHousekeepingTaskSchema,
  updateHousekeepingTaskSchema,
  filterHousekeepingHistorySchema
} from '../validations/housekeepingValidations';

const hkRepo = new HousekeepingRepository(pool);
const notifRepo = new NotificationRepository(pool);
const hkService = new HousekeepingService(pool, hkRepo, notifRepo);
const hkController = new HousekeepingController(hkService);

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
    res.status(403).json({ success: false, message: 'Access denied: insufficient staff role permissions' });
    return;
  };
};

router.use(authenticate);

// Analytics & Reports (Admins, Reception, Housekeeping Leads)
router.get('/analytics', allowRoles(['Housekeeping']), hkController.getDashboardAnalytics);

// Tasks CRUD & Workflow Management
router.get('/tasks', allowRoles(['Housekeeping', 'Technician']), hkController.getTasks);
router.get('/tasks/:id', allowRoles(['Housekeeping']), hkController.getTaskById);
router.post('/tasks', allowRoles(['Housekeeping']), validateRequest(createHousekeepingTaskSchema), hkController.createTask);
router.patch('/tasks/:id/status', allowRoles(['Housekeeping']), validateRequest(updateHousekeepingTaskSchema), hkController.updateTask);
router.delete('/tasks/:id', allowRoles([]), hkController.deleteTask); // Admins & Reception only

// Cleaning History (Audit log & staff timing)
router.get('/history', allowRoles(['Housekeeping']), validateRequest(filterHousekeepingHistorySchema), hkController.getCleaningHistory);

export default router;
