import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { HTTP_STATUS } from '../constants/httpStatuses';

export const validateRequest = (schema: AnyZodObject): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => {
          const cleanPath = e.path.filter((p) => p !== 'body' && p !== 'params' && p !== 'query').join('.');
          return {
            field: cleanPath || e.path.join('.'),
            message: e.message,
          };
        });
        const firstError = formattedErrors[0] || { field: 'unknown', message: 'Validation failed' };

        console.error(`❌ [Zod Validation Error] on ${req.method} ${req.originalUrl}:`, JSON.stringify(formattedErrors, null, 2));

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          field: firstError.field,
          message: firstError.message,
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};
