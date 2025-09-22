import winston from 'winston';
// import { config } from '@logitrack/config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      service,
      message,
      ...meta
    });
  })
);

export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    // level: config.nodeEnv === 'production' ? 'info' : 'debug',
     level: 'debug',
    format: logFormat,
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        // format: config.nodeEnv === 'production' 
        format: true 
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-error.log`,
        level: 'error'
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-combined.log`
      })
    ]
  });
};

// Request logging middleware
export const requestLogger = (serviceName: string) => {
  const logger = createLogger(serviceName);
  
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    });
    
    next();
  };
};