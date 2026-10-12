import rateLimit from 'express-rate-limit';

// Global API Limiter: 300 requests per 1 minute (excludes dedicated OAuth flow)
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  skip: (req) => {
    // Isolate OAuth initiation and callback routes from general API polling rate limits
    const path = req.path || '';
    const origUrl = req.originalUrl || '';
    return path.includes('/auth/google') || origUrl.includes('/auth/google');
  },
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OAuth Route Limiter: dedicated for OAuth initiation & callback
// Separated from general API polling requests so background traffic never starves user authentication
export const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in a few minutes.',
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
