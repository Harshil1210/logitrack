# 🐳 Docker Deployment Guide

## Quick Start

### 1. Development Environment (Infrastructure Only)
```bash
# Start MongoDB and Redis for local development
docker-compose -f docker-compose.dev.yml up -d

# Access admin UIs
# MongoDB: http://localhost:8081
# Redis: http://localhost:8082
```

### 2. Full Production Environment
```bash
# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Build Individual Services
```bash
# Windows
scripts\docker-build.bat

# Or build manually
docker build -t logitrack/auth-service ./services/auth
docker build -t logitrack/order-service ./services/order
```

## Service URLs
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Order Service**: http://localhost:3002
- **Notification Service**: http://localhost:3003

## Docker Commands

### Management
```bash
# Stop all services
docker-compose down

# Remove volumes (data loss!)
docker-compose down -v

# Rebuild and restart
docker-compose up --build -d

# Scale services
docker-compose up -d --scale order-service=3
```

### Monitoring
```bash
# View service status
docker-compose ps

# View logs
docker-compose logs order-service

# Execute commands in container
docker-compose exec order-service sh
```

## Environment Variables
Required variables in `.env`:
- Database credentials
- Redis URL
- JWT secrets
- AWS credentials (S3, SQS)
- SMTP settings

## Health Checks
Each service exposes health endpoints:
- `GET /` - Service info and status
- WebSocket connections on order service

## Volumes
- `mongodb_data` - Database persistence
- `redis_data` - Cache persistence
- `./services/*/logs` - Application logs