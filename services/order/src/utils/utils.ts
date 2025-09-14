import { Types } from "mongoose";
import productModel from "../models/product.model";
import { OrderItem } from "../types/types";

export const checkProductAvailability = async (
  items: OrderItem[]
): Promise<{ enrichedItems: OrderItem[]; totalAmount: number }> => {
  const unavailableItems: string[] = [];
  let totalAmount = 0;
  const enrichedItems: OrderItem[] = [];

  for (const item of items) {
    const product: any = await productModel.findById(item.productId);

    if (!product) {
      unavailableItems.push(`Product ${item.productId} not found`);
      continue;
    }

    if (product.stock < item.quantity) {
      unavailableItems.push(`${product.name} has insufficient stock`);
      continue;
    }

    const sub_total = product.price * item.quantity;
    totalAmount += sub_total;

    enrichedItems.push({
      productId: product._id,
      sub_total,
      quantity: item.quantity,
    });
  }

  if (unavailableItems.length > 0) {
    throw new Error(`Order failed: ${unavailableItems.join(", ")}`);
  }

  return { enrichedItems, totalAmount };
};

export const validateObjectId = (id: string) =>
  Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
