import orderModel, { OrderStatus } from "../models/order.model";
import productModel from "../models/product.model";
import { OrderData } from "../types/types";
import { checkProductAvailability, validateObjectId } from "../utils/utils";
import { publishOrderUpdate } from "./sqsPublisher";
import { mapOrderStatus } from "../utils/statusMapper";
import { cacheUserOrders, getCachedUserOrders, deleteCache, createLogger } from "@logitrack/shared";
import { broadcastOrderUpdate } from "./websocketService";
import mongoose, { Types } from "mongoose";

const logger = createLogger('order-service');

export const createOrderService = async (
  data: OrderData,
  userId: string,
  userEmail: string
) => {
  const session = await mongoose.startSession();
  
  try {
    const result = await session.withTransaction(async () => {
      const { enrichedItems, totalAmount } = await checkProductAvailability(data.items);
      
      for (const item of data.items) {
        const product = await productModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );
        
        if (product && product.stock < 0) {
          logger.error('Insufficient stock detected', {
            productId: item.productId,
            requestedQuantity: item.quantity,
            availableStock: product.stock + item.quantity
          });
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }
      }
      
      const [newOrder] = await orderModel.create([{
        userId: userId,
        items: enrichedItems,
        deliveryAddress: data.deliveryAddress,
        scheduledDate: data.scheduledDate,
        status: OrderStatus.PLACED,
        totalAmount,
      }], { session });
      
      return { newOrder, enrichedItems, totalAmount };
    });
    
    await publishOrderUpdate({
      orderId: (result.newOrder._id as Types.ObjectId).toString(),
      userId: userId,
      userEmail: userEmail,
      status: "confirmed",
      timestamp: new Date().toISOString(),
      orderDetails: {
        items: result.enrichedItems.map((item: any) => item.productName || "Product"),
        totalAmount: result.totalAmount,
      },
    });
    
    // Invalidate user orders cache
    await deleteCache(`user:${userId}:orders`);
    
    logger.info('Order created successfully', {
      orderId: result.newOrder._id.toString(),
      userId,
      totalAmount: result.totalAmount,
      itemCount: result.enrichedItems.length
    });
    
    // Broadcast real-time update
    broadcastOrderUpdate(result.newOrder._id.toString(), 'confirmed', userId);
    
    return result.newOrder;
    
  } finally {
    await session.endSession();
  }
};

export const getAllOrdersService = async () => {
  return await orderModel.find().sort({ createdAt: -1 }).lean();
};

export const getOrderByIdService = async (id: string) => {
  return await orderModel.findById(id);
};

export const cancelOrderService = async (id: string, userEmail: string) => {
  if (!validateObjectId(id)) {
    throw Error("Invalid object Id");
  }

  const order = await orderModel.findById(id);

  if (!order) {
    return null;
  }

  for (const item of order.items) {
    await productModel.findByIdAndUpdate(item.productId, {
      $inc: { stock: +item.quantity! },
    });
  }

  const cancelledOrder = await orderModel.findByIdAndUpdate(
    id,
    { status: "CANCELLED" },
    { new: true }
  );

  if (cancelledOrder) {
    await publishOrderUpdate({
      orderId: (cancelledOrder._id as Types.ObjectId).toString(),
      userId: cancelledOrder.userId.toString(),
      userEmail: userEmail,
      status: "cancelled",
      timestamp: new Date().toISOString(),
      orderDetails: {
        items: cancelledOrder.items.map(
          (item: any) => item.productName || "Product"
        ),
        totalAmount: cancelledOrder.totalAmount,
      },
    });
  }

  // Invalidate user orders cache and broadcast update
  if (cancelledOrder) {
    await deleteCache(`user:${cancelledOrder.userId}:orders`);
    broadcastOrderUpdate(cancelledOrder._id.toString(), 'cancelled', cancelledOrder.userId.toString());
  }
  
  return cancelledOrder;
};

export const updateOrderStatusService = async (
  id: string,
  status: string,
  userEmail: string
) => {
  const validStatuses = ["PLACED", "DISPATCHED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  const updatedOrder = await orderModel.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (updatedOrder) {
    await publishOrderUpdate({
      orderId: (updatedOrder._id as Types.ObjectId).toString(),
      userId: updatedOrder.userId.toString(),
      userEmail: userEmail,
      status: mapOrderStatus(status),
      timestamp: new Date().toISOString(),
      orderDetails: {
        items: updatedOrder.items.map(
          (item: any) => item.productName || "Product"
        ),
        totalAmount: updatedOrder.totalAmount,
      },
    });
  }

  // Invalidate user orders cache and broadcast update
  if (updatedOrder) {
    await deleteCache(`user:${updatedOrder.userId}:orders`);
    broadcastOrderUpdate(updatedOrder._id.toString(), mapOrderStatus(status), updatedOrder.userId.toString());
  }
  
  return updatedOrder;
};

export const getOrdersByUserService = async (userId: string) => {
  if (!validateObjectId(userId)) {
    throw Error("Invalid object Id");
  }

  // Check cache first
  const cachedOrders = await getCachedUserOrders(userId);
  if (cachedOrders) {
    return cachedOrders;
  }

  // Fetch from DB and cache
  const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });
  await cacheUserOrders(userId, orders);
  
  return orders;
};
