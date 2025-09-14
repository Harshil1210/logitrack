import orderModel, { OrderStatus } from "../models/order.model";
import productModel from "../models/product.model";
import { OrderData } from "../types/types";
import { checkProductAvailability, validateObjectId } from "../utils/utils";

export const createOrderService = async (data: OrderData, userId: string) => {
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

  return newOrder;
};

export const getAllOrdersService = async () => {
  return await orderModel.find().sort({ createdAt: -1 });
};

export const getOrderByIdService = async (id: string) => {
  return await orderModel.findById(id);
};

export const cancelOrderService = async (id: string) => {
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

  return cancelledOrder;
};

export const updateOrderStatusService = async (id: string, status: string) => {
  const validStatuses = ["PLACED", "DISPATCHED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  return await orderModel.findByIdAndUpdate(id, { status }, { new: true });
};

export const getOrdersByUserService = async (userId: string) => {
  if (!validateObjectId(userId)) {
    throw Error("Invalid object Id");
  }
  return await orderModel.find({ userId }).sort({ createdAt: -1 });
};
