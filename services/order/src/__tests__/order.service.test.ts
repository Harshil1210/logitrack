import { createOrderService, getOrdersByUserService } from '../services/order.service';
import { createProductService } from '../services/product.service';
import { publishOrderUpdate } from '../services/sqsPublisher';
import productModel from '../models/product.model';
import orderModel from '../models/order.model';

const mockPublishOrderUpdate = publishOrderUpdate as jest.MockedFunction<typeof publishOrderUpdate>;

describe('Order Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrderService', () => {
    it('should create order successfully with transaction', async () => {
      // Create test product
      const product = await productModel.create({
        name: 'Test Product',
        price: 100,
        stock: 10,
        description: 'Test description'
      });

      const orderData = {
        items: [{ productId: product._id.toString(), quantity: 2 }],
        deliveryAddress: 'Test Address',
        scheduledDate: new Date()
      };

      const order = await createOrderService(orderData, 'user123', 'test@example.com');

      expect(order).toBeDefined();
      expect(order.userId).toBe('user123');
      expect(order.totalAmount).toBe(200);
      expect(mockPublishOrderUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: order._id.toString(),
          userId: 'user123',
          userEmail: 'test@example.com',
          status: 'confirmed'
        })
      );

      // Check stock was decremented
      const updatedProduct = await productModel.findById(product._id);
      expect(updatedProduct?.stock).toBe(8);
    });

    it('should rollback transaction on insufficient stock', async () => {
      const product = await productModel.create({
        name: 'Test Product',
        price: 100,
        stock: 1,
        description: 'Test description'
      });

      const orderData = {
        items: [{ productId: product._id.toString(), quantity: 5 }],
        deliveryAddress: 'Test Address',
        scheduledDate: new Date()
      };

      await expect(
        createOrderService(orderData, 'user123', 'test@example.com')
      ).rejects.toThrow('Insufficient stock');

      // Check stock unchanged
      const unchangedProduct = await productModel.findById(product._id);
      expect(unchangedProduct?.stock).toBe(1);

      // Check no order created
      const orders = await orderModel.find();
      expect(orders).toHaveLength(0);
    });
  });

  describe('getOrdersByUserService', () => {
    it('should return user orders', async () => {
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

      const orders = await getOrdersByUserService('user123');
      
      expect(orders).toHaveLength(1);
      expect(orders[0].userId).toBe('user123');
    });
  });
});