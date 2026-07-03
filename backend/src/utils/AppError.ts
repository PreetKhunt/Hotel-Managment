export enum ErrorCode {
  BOOKING_ALREADY_EXISTS = 'BOOKING_ALREADY_EXISTS',
  ROOM_NOT_AVAILABLE = 'ROOM_NOT_AVAILABLE',
  PAYMENT_VERIFICATION_FAILED = 'PAYMENT_VERIFICATION_FAILED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  INVALID_BOOKING_STATE = 'INVALID_BOOKING_STATE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND'
}

export class AppError extends Error {
  public statusCode: number;
  public errorCode: ErrorCode;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode: ErrorCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}
