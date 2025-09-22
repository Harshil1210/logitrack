import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../lib/redis';
import { AppError } from '../errors/appError';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export const createRedisRateLimit = (options: RateLimitOptions) => {
  const { windowMs, max, message = 'Too many requests', keyGenerator } = options;
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator ? keyGenerator(req) : `rate_limit:${req.ip}`;
      const window = Math.floor(Date.now() / windowMs);
      const redisKey = `${key}:${window}`;
      
      const current = await redisClient.incr(redisKey);
      
      if (current === 1) {
        await redisClient.expire(redisKey, Math.ceil(windowMs / 1000));
      }
      
      if (current > max) {
        return next(new AppError(message, 429));
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': Math.max(0, max - current).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });
      
      next();
    } catch (error) {
      // Fallback: allow request if Redis fails
      next();
    }
  };
};

// Predefined rate limiters
export const apiLimiter = createRedisRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many API requests'
});

export const authLimiter = createRedisRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts',
  keyGenerator: (req) => `auth_limit:${req.ip}`
});

export const strictLimiter = createRedisRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Rate limit exceeded'
});