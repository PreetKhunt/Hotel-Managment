import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps async express handlers to prevent unhandled promise rejections
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
