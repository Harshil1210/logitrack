import { config } from '@logitrack/config';

console.log(`Order service running on port ${config.ports.order}`);
console.log(`Database: ${config.database.url}`);