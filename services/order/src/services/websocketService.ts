import { io } from '../index';
import { OrderStatusUpdate, createLogger } from '@logitrack/shared';

const logger = createLogger('order-service');

export const broadcastOrderUpdate = (orderId: string, status: string, userId: string) => {
  const update: OrderStatusUpdate = {
    orderId,
    status,
    timestamp: new Date().toISOString(),
    message: `Order ${orderId} is now ${status.toLowerCase()}`
  };

  // Send to specific user room
  io.to(`user:${userId}`).emit('order-status-update', update);
  
  // Send to admin room
  io.to('admin').emit('order-status-update', update);

  logger.info('Order status broadcasted', {
    orderId,
    status,
    userId,
    rooms: [`user:${userId}`, 'admin']
  });
};

export const broadcastUploadProgress = (uploadId: string, progress: number, filename: string, status: 'uploading' | 'completed' | 'error') => {
  const progressUpdate = {
    uploadId,
    progress,
    filename,
    status,
    timestamp: new Date().toISOString()
  };

  io.emit('upload-progress', progressUpdate);

  logger.debug('Upload progress broadcasted', {
    uploadId,
    progress,
    filename,
    status
  });
};