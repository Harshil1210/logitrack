import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@logitrack/shared';

const logger = createLogger('order-service');

export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  next(err);
};