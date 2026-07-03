import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { AuthAuditLogService } from '../services/AuthAuditLogService';
import { UserRepository } from '../domain/repositories/postgres/UserRepository';
import { AuthAuditLogRepository } from '../domain/repositories/postgres/AuthAuditLogRepository';
import { pgPool as pool } from '../config/database';
import { supabase } from '../config/supabase';

const userRepo = new UserRepository(pool);
const authAuditLogRepo = new AuthAuditLogRepository(pool);
const authAuditLogService = new AuthAuditLogService(authAuditLogRepo);
const authService = new AuthService(supabase, userRepo, authAuditLogService);
const authController = new AuthController(authService);

const router = Router();

// Public Routes
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authController.logout);

// OAuth Routes
/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Get Google OAuth URL
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google
 */
router.get('/google', authController.googleOAuth);

/**
 * @swagger
 * /auth/callback:
 *   get:
 *     summary: Handle OAuth Callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to frontend
 */
router.get('/callback', authController.googleCallback);

export default router;
