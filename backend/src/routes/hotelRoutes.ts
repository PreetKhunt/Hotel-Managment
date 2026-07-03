import { Router } from 'express';
import { HotelController } from '../controllers/hotelController';
import { authenticate, requirePermission } from '../middleware/auth';
import { HotelService } from '../services/HotelService';
import { HotelRepository } from '../domain/repositories/postgres/HotelRepository';
import { HotelSettingsRepository } from '../domain/repositories/postgres/HotelSettingsRepository';
import { pgPool } from '../config/database';

const hotelRepo = new HotelRepository(pgPool);
const settingsRepo = new HotelSettingsRepository(pgPool);
const hotelService = new HotelService(hotelRepo, settingsRepo);
const hotelController = new HotelController(hotelService);

const router = Router();

/**
 * @swagger
 * /hotels/settings:
 *   get:
 *     summary: Get public hotel settings
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/settings', hotelController.getSettings);

/**
 * @swagger
 * /hotels/settings:
 *   put:
 *     summary: Update hotel settings
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/settings', authenticate, requirePermission('full_access'), hotelController.updateSettings);

export default router;
