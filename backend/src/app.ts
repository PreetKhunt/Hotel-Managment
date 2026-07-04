import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes';
import { HTTP_STATUS } from './constants/httpStatuses';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { tracingMiddleware } from './middleware/tracing';
import { globalLimiter } from './middleware/rateLimiter';

const app: Express = express();

// Trust reverse proxy for Railway/Vercel (required for rate limiting)
app.set('trust proxy', 1);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);

// Set security HTTP headers
app.use(helmet());

// Tracing Context and Request ID
app.use(tracingMiddleware);

// Enable CORS
app.use(
  cors({
    origin: [
      env.CORS_ORIGIN,
      'http://localhost:3000',
      'http://localhost:3001',
      'https://hotel-managments.netlify.app',
      'https://hotel-managment-production-8824.up.railway.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// Compress response bodies
app.use(compression());

// Parse incoming request cookies
app.use(cookieParser());

// Parse incoming request JSON payloads
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded request payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Log HTTP requests
app.use(requestLogger);

// Base route redirect or response
app.get('/', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Welcome to Hospitality Hub Hotel Management System API (Phase 2 Backend Foundation)',
  });
});

app.get('/health', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});

// Mount Central API Router
app.use('/api/v1', globalLimiter as any, apiRouter);

// Fallback 404 Route handler
app.use(notFoundHandler);

// Fallback Global Error boundary middleware
app.use(errorHandler);

export default app;
