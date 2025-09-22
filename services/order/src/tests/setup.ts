import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Mock Redis client
jest.mock('@logitrack/shared', () => ({
  ...jest.requireActual('@logitrack/shared'),
  cacheProduct: jest.fn(),
  getCachedProduct: jest.fn().mockResolvedValue(null),
  cacheUserOrders: jest.fn(),
  getCachedUserOrders: jest.fn().mockResolvedValue(null),
  deleteCache: jest.fn(),
}));

// Mock SQS publisher
jest.mock('../services/sqsPublisher', () => ({
  publishOrderUpdate: jest.fn(),
}));