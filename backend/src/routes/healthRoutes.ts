import { Router, Request, Response } from 'express';
import { pgPool } from '../config/database';
import { logger } from '../utils/logger';
import { supabase } from '../config/supabase';
import { razorpay } from '../config/razorpay';
import { HTTP_STATUS } from '../constants/httpStatuses';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 *       503:
 *         description: System is degraded
 */
router.get('/', async (_req: Request, res: Response) => {
  const healthStatus: any = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    services: {}
  };

  let hasError = false;

  // 1. Check Database
  try {
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    healthStatus.services.database = 'UP';
  } catch (error: any) {
    logger.error('PostgreSQL Health Check Failed', {
      errorMessage: error.message,
      sqlState: error.code,
      stackTrace: error.stack,
      host: (pgPool as any).options?.host || 'unknown',
      port: (pgPool as any).options?.port || 'unknown',
      ssl: (pgPool as any).options?.ssl ? true : false,
      databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
    });
    healthStatus.services.database = 'DOWN';
    healthStatus.services.database_error = error.message; // optional insight for API response
    hasError = true;
  }

  // 2. Check Supabase (Storage)
  try {
    const { error } = await supabase.storage.listBuckets();
    if (error) throw error;
    healthStatus.services.supabase = 'UP';
  } catch (error) {
    healthStatus.services.supabase = 'DOWN';
    hasError = true;
  }

  // 3. Check Razorpay
  try {
    // Attempting a simple operation or checking if instance is defined. 
    // Razorpay doesn't have a direct ping, so we just check if it's initialized correctly.
    if (!(razorpay as any).key_id) throw new Error('Missing Key');
    healthStatus.services.razorpay = 'UP';
  } catch (error) {
    healthStatus.services.razorpay = 'DOWN';
    hasError = true;
  }

  if (hasError) {
    healthStatus.status = 'DEGRADED';
    return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(healthStatus);
  }

  return res.status(HTTP_STATUS.OK).json(healthStatus);
});

export default router;
