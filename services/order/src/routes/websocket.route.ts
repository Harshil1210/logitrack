import express from 'express';
import { io } from '../index';

const router = express.Router();

// WebSocket connection info endpoint
router.get('/info', (req, res) => {
  res.json({
    websocket: {
      url: `ws://localhost:${process.env.PORT || 3002}`,
      events: {
        'order-status-update': 'Real-time order status changes',
        'upload-progress': 'File upload progress updates'
      },
      rooms: {
        'user:{userId}': 'User-specific order updates',
        'admin': 'All order updates for admins'
      }
    }
  });
});

// Test endpoint to trigger sample events
router.post('/test-broadcast', (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'order-update') {
    io.emit('order-status-update', {
      orderId: 'test-123',
      status: 'shipped',
      timestamp: new Date().toISOString(),
      message: 'Test order update'
    });
  }
  
  res.json({ message: 'Test broadcast sent', event, data });
});

export default router;