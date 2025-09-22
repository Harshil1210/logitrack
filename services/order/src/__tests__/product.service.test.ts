import { createProductService, getProductByIdService, getAllProductsService } from '../services/product.service';
import { cacheProduct, getCachedProduct } from '@logitrack/shared';
import productModel from '../models/product.model';

const mockCacheProduct = cacheProduct as jest.MockedFunction<typeof cacheProduct>;
const mockGetCachedProduct = getCachedProduct as jest.MockedFunction<typeof getCachedProduct>;

describe('Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProductService', () => {
    it('should create product and cache it', async () => {
      const productData = {
        body: {
          name: 'Test Product',
          description: 'Test description',
          price: 100,
          stock: 10
        },
        fileKey: 'test-image.jpg'
      };

      const product = await createProductService(productData);

      expect(product).toBeDefined();
      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(100);
      expect(mockCacheProduct).toHaveBeenCalledWith(
        product._id.toString(),
        product
      );
    });

    it('should throw validation error for invalid data', async () => {
      const productData = {
        body: {
          name: '',
          price: -10,
          stock: 'invalid'
        }
      };

      await expect(createProductService(productData)).rejects.toThrow();
    });
  });

  describe('getProductByIdService', () => {
    it('should return cached product if available', async () => {
      const cachedProduct = { _id: 'cached123', name: 'Cached Product' };
      mockGetCachedProduct.mockResolvedValueOnce(cachedProduct);

      const result = await getProductByIdService('cached123');

      expect(result).toEqual(cachedProduct);
      expect(mockGetCachedProduct).toHaveBeenCalledWith('cached123');
    });

    it('should fetch from DB and cache if not in cache', async () => {
      mockGetCachedProduct.mockResolvedValueOnce(null);
      
      const product = await productModel.create({
        name: 'DB Product',
        price: 50,
        stock: 5,
        description: 'From database'
      });

      const result = await getProductByIdService(product._id.toString());

      expect(result.name).toBe('DB Product');
      expect(mockCacheProduct).toHaveBeenCalledWith(
        product._id.toString(),
        expect.any(Object)
      );
    });
  });

  describe('getAllProductsService', () => {
    it('should return cached products if available', async () => {
      const cachedProducts = [{ name: 'Product 1' }, { name: 'Product 2' }];
      mockGetCachedProduct.mockResolvedValueOnce(cachedProducts);

      const result = await getAllProductsService();

      expect(result).toEqual(cachedProducts);
      expect(mockGetCachedProduct).toHaveBeenCalledWith('all-products');
    });
  });
});