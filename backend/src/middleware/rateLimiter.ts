import rateLimit from 'express-rate-limit';

// Global API Limiter: 100 requests per 1 minute
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Booking Creation Limiter: 10 requests per minute
export const bookingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many booking attempts, please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payment Verification Limiter: 20 requests per minute
export const paymentVerificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many payment verification attempts, please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
