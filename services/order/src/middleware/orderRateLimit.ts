import { createRedisRateLimit } from '@logitrack/shared';

// Order creation rate limit - prevent spam orders
export const orderCreationLimit = createRedisRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 orders per 5 minutes per user
  message: 'Too many orders created. Please wait before creating another order.',
  keyGenerator: (req: any) => `order_limit:${req.user?.userId || req.ip}`
});

// Product upload rate limit
export const productUploadLimit = createRedisRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 uploads per 10 minutes
  message: 'Too many file uploads. Please wait before uploading again.',
  keyGenerator: (req) => `upload_limit:${req.ip}`
});