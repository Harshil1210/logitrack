import orderModel, { OrderStatus } from "../models/order.model";
import productModel from "../models/product.model";
import { OrderData } from "../types/types";
import { checkProductAvailability, validateObjectId } from "../utils/utils";
import { publishOrderUpdate } from "./sqsPublisher";
import { mapOrderStatus } from "../utils/statusMapper";
import { Types } from "mongoose";

export const createOrderService = async (
  data: OrderData,
  userId: string,
  userEmail: string
) => {
  const { enrichedItems, totalAmount } = await checkProductAvailability(
    data.items
  );

  await Promise.all(
    data.items.map((item) =>
      productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      })
    )
  );

  const newOrder = await orderModel.create({
    userId: userId,
    items: enrichedItems,
    deliveryAddress: data.deliveryAddress,
    scheduledDate: data.scheduledDate,
    status: OrderStatus.PLACED,
    totalAmount,
  });

  await publishOrderUpdate({
    orderId: (newOrder._id as Types.ObjectId).toString(),
    userId: userId,
    userEmail: userEmail,
    status: "confirmed",
    timestamp: new Date().toISOString(),
    orderDetails: {
      items: enrichedItems.map((item: any) => item.productName || "Product"),
      totalAmount,
    },
  });

  return newOrder;
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

  return updatedOrder;
};

export const getOrdersByUserService = async (userId: string) => {
  if (!validateObjectId(userId)) {
    throw Error("Invalid object Id");
  }
  return await orderModel.find({ userId }).sort({ createdAt: -1 });
};
