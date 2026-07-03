import winston from 'winston';
import { env } from '../config/env';
import { AsyncLocalStorage } from 'async_hooks';

export const loggerContext = new AsyncLocalStorage<Map<string, string>>();

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const store = loggerContext.getStore();
    const reqId = store?.get('requestId') || 'N/A';
    const corrId = store?.get('correlationId') || 'N/A';
    const bookingRef = store?.get('bookingReference') || '';
    const refStr = bookingRef ? ` [Ref:${bookingRef}]` : '';
    return `[${info.timestamp}] [${info.level}] [Req:${reqId}] [Corr:${corrId}]${refStr}: ${info.message}`;
  })
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format,
  transports,
});
