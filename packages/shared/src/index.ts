// Errors
export { AppError } from "./errors/appError";
export { globalErrorHandler } from "./errors/globalErrorHandler";

// Middleware
export { requireAuth, roleMiddleware } from "./middleware/auth";
export { csrfProtection, generateCSRFToken } from "./middleware/csrf";

// Types
export type {
  AuthenticatedUser,
  AuthenticatedRequest,
  Role,
} from "./types/auth";

// Rate limiter
export {
  apiLimiter,
  authLimiter,
  publicLimiter,
} from "./middleware/rateLimiter";
export { createRedisRateLimit, apiLimiter as redisApiLimiter, authLimiter as redisAuthLimiter, strictLimiter } from './middleware/redisRateLimiter';

// Utils
export { sanitizeString, sanitizeObjectId, sanitizeObject, sanitizeForLog } from './utils/sanitizer';

// Redis
export { redisClient, connectRedis } from './lib/redis';
export { createSession, getSession, deleteSession, refreshSession } from './services/sessionService';
export { setCache, getCache, deleteCache, cacheExists, cacheProduct, getCachedProduct, cacheUserOrders, getCachedUserOrders } from './services/cacheService';

// Logging
export { createLogger, requestLogger } from './lib/logger';

// WebSocket
export { createWebSocketServer } from './lib/websocket';
export type { OrderStatusUpdate, UploadProgress } from './lib/websocket';
