import { config } from '@logitrack/config';

console.log(`API Gateway running on port ${config.ports.gateway}`);
console.log(`Auth Service: localhost:${config.ports.auth}`);
console.log(`Order Service: localhost:${config.ports.order}`);
console.log(`Notification Service: localhost:${config.ports.notification}`);