import { config } from '@logitrack/config';

console.log(`Auth service running on port ${config.ports.auth}`);
console.log(`Database: ${config.database.url}`);
console.log(`JWT Secret configured: ${config.jwt.secret ? 'Yes' : 'No'}`);