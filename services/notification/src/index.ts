import { config } from '@logitrack/config';

console.log(`Notification service running on port ${config.ports.notification}`);
console.log(`SMTP Host: ${config.smtp.host}`);