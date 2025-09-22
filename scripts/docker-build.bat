@echo off
echo 🐳 Building LogiTrack Docker Images...

echo Building Auth Service...
docker build -t logitrack/auth-service:latest ./services/auth

echo Building Order Service...
docker build -t logitrack/order-service:latest ./services/order

echo Building Notification Service...
docker build -t logitrack/notification-service:latest ./services/notification

echo Building API Gateway...
docker build -t logitrack/api-gateway:latest ./services/api-gateway

echo ✅ All images built successfully!

REM Show images
docker images | findstr logitrack