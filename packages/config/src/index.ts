import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    default: process.env.DATABASE_URL || "mongodb://localhost:27017/logitrack",
    auth: process.env.DATABASE_AUTH_URL || "mongodb://localhost:27017/logitrack_auth",
    order: process.env.DATABASE_ORDER_URL || "mongodb://localhost:27017/logitrack_orders",
    notification:
      process.env.DATABASE_NOTIFICATION_URL ||
      "mongodb://localhost:27017/logitrack_notifications",
    name: process.env.DATABASE_NAME || "logitrack",
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'REFRESH_TOKEN_SECRET'
  },
  google : {
    clientId : process.env.GOOGLE_CLIENT_ID || '',
    clientSecret : process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl : process.env.GOOGLE_CALLBACK_URL || ''
  },
  ports: {
    auth: parseInt(process.env.AUTH_SERVICE_PORT || '3001'),
    order: parseInt(process.env.ORDER_SERVICE_PORT || '3002'),
    notification: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3003'),
    gateway: parseInt(process.env.API_GATEWAY_PORT || '3000')
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
    gateway: process.env.API_GATEWAY_URL || 'http://localhost:3000'
  },
  s3: {
    bucketName: process.env.S3_BUCKET_NAME!,
    accessKey: process.env.AWS_ACCESS_KEY!,
    secretKey: process.env.AWS_SECRET_KEY!,
    region: process.env.AWS_REGION!,
  },
  sqs: {
    queueUrl: process.env.SQS_QUEUE_URL!,
    accessKey: process.env.SQS_ACCESS_KEY!,
    secretKey: process.env.SQS_SECRET_KEY!,
    region: process.env.SQS_REGION!,
  }
};