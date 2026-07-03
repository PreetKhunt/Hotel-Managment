import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { loggerContext } from '../utils/logger';

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const store = new Map<string, string>();
  
  // Use existing request ID from load balancer if available, else generate
  const reqId = (req.headers['x-request-id'] as string) || uuidv4();
  // Correlation ID from frontend/client, fallback to request ID
  const corrId = (req.headers['x-correlation-id'] as string) || reqId;

  store.set('requestId', reqId);
  store.set('correlationId', corrId);

  // Expose on request object for easy access
  (req as any).id = reqId;
  res.setHeader('X-Request-Id', reqId);

  loggerContext.run(store, () => {
    next();
  });
};
