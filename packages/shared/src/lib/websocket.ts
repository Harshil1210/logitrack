import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createLogger } from './logger';

const logger = createLogger('websocket');

export const createWebSocketServer = (httpServer: HttpServer, serviceName: string) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    logger.info('WebSocket client connected', {
      socketId: socket.id,
      service: serviceName
    });

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      logger.debug('Client joined room', { socketId: socket.id, roomId });
    });

    socket.on('disconnect', () => {
      logger.info('WebSocket client disconnected', {
        socketId: socket.id,
        service: serviceName
      });
    });
  });

  return io;
};

// Event types
export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  timestamp: string;
  message: string;
}

export interface UploadProgress {
  uploadId: string;
  progress: number;
  filename: string;
  status: 'uploading' | 'completed' | 'error';
}