import { Request, Response, NextFunction } from 'express';
import { pgPool } from '../config/database';
// import { sendError } from './apiResponse';

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    return next();
  }

  const client = await pgPool.connect();
  try {
    const checkRes = await client.query('SELECT response_status, response_body FROM idempotency_keys WHERE key = $1', [idempotencyKey]);
    
    if (checkRes.rows.length > 0) {
      // Duplicate request found, return original response
      const originalResponse = checkRes.rows[0];
      return res.status(originalResponse.response_status).json(originalResponse.response_body);
    }

    // Intercept response to save it
    const originalSend = res.json;
    res.json = function (body) {
      const status = res.statusCode;
      
      // Save to DB asynchronously
      pgPool.query(
        'INSERT INTO idempotency_keys (key, user_id, request_path, response_body, response_status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (key) DO NOTHING',
        [idempotencyKey, req.body?.userId || null, req.originalUrl, body, status]
      ).catch(err => console.error('Failed to save idempotency key:', err));

      return originalSend.call(this, body);
    };

    next();
  } catch (error) {
    console.error('Idempotency middleware error:', error);
    next();
  } finally {
    client.release();
  }
};
