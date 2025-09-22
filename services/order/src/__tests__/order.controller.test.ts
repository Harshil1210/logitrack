import request from 'supertest';
import express from 'express';
import orderRoutes from '../routes/order.route';
import productModel from '../models/product.model';
import orderModel from '../models/order.model';

const app = express();
app.use(express.json());
app.use('/orders', orderRoutes);

// Mock auth middleware
jest.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { userId: 'testuser123', email: 'test@example.com' };
    next();
  }
}));

describe('Order Controller', () => {
  describe('POST /orders', () => {
    it('should create order successfully', async () => {
      const product = await productModel.create({
        name: 'Test Product',
        price: 100,
        stock: 10,
        description: 'Test description'
      });

      const orderData = {
        items: [{ productId: product._id.toString(), quantity: 2 }],
        deliveryAddress: 'Test Address',
        scheduledDate: new Date().toISOString()
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.message).toBe('Order placed successfully');
      expect(response.body.order).toBeDefined();
    });

    it('should return 400 for invalid order data', async () => {
      const invalidOrderData = {
        items: [],
        deliveryAddress: ''
      };

      const response = await request(app)
        .post('/orders')
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /orders', () => {
    it('should return all orders', async () => {
      const product = await productModel.create({
        name: 'Test Product',
        price: 100,
        stock: 10,
        description: 'Test description'
      });

      await orderModel.create({
        userId: 'user123',
        items: [{ productId: product._id, quantity: 1, productName: 'Test Product', price: 100 }],
        deliveryAddress: 'Test Address',
        totalAmount: 100,
        status: 'PLACED'
      });

      const response = await request(app)
        .get('/orders')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return specific order', async () => {
      const product = await productModel.create({
        name: 'Test Product',
        price: 100,
        stock: 10,
        description: 'Test description'
      });

      const order = await orderModel.create({
        userId: 'user123',
        items: [{ productId: product._id, quantity: 1, productName: 'Test Product', price: 100 }],
        deliveryAddress: 'Test Address',
        totalAmount: 100,
        status: 'PLACED'
      });

      const response = await request(app)
        .get(`/orders/${order._id}`)
        .expect(200);

      expect(response.body._id).toBe(order._id.toString());
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .get(`/orders/${fakeId}`)
        .expect(404);
    });
  });
});