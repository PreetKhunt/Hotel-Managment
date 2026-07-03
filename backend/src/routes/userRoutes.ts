import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, requirePermission } from '../middleware/auth';
import { UserService } from '../services/UserService';
import { UserRepository } from '../domain/repositories/postgres/UserRepository';
import { RoleRepository } from '../domain/repositories/postgres/RoleRepository';
import { pgPool as pool } from '../config/database';

const userRepo = new UserRepository(pool);
const roleRepo = new RoleRepository(pool);
const userService = new UserService(userRepo, roleRepo);
const userController = new UserController(userService);

const router = Router();

// Profile Routes (Self)
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/me', authenticate, userController.getProfile);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/me', authenticate, userController.updateProfile);

// Admin Routes
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authenticate, requirePermission('view_guests'), userController.getUsers);

/**
 * @swagger
 * /users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/status', authenticate, requirePermission('full_access'), userController.updateUserStatus);

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id/role', authenticate, requirePermission('full_access'), userController.updateUserRole);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', authenticate, requirePermission('full_access'), userController.deleteUser);

export default router;
