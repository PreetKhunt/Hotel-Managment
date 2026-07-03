import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  meta?: any;
  requestId: string;
  errorCode?: string;
}

/**
 * Standardizes successful API responses
 */
export const sendSuccess = (res: Response, data: any, message: string = 'Success', meta: any = {}) => {
  const req = res.req;
  const responseBody: ApiResponse<any> = {
    success: true,
    data,
    message,
    meta,
    requestId: req.id
  };
  return res.status(200).json(responseBody);
};

/**
 * Standardizes API error responses
 */
export const sendError = (res: Response, message: string, statusCode: number = 500, data: any = null, errorCode?: string) => {
  const req = res.req;
  const responseBody: ApiResponse<any> = {
    success: false,
    data,
    message,
    requestId: req.id,
    ...(errorCode && { errorCode })
  };
  return res.status(statusCode).json(responseBody);
};

// Extend Express Request interface to include 'id'
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
