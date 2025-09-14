import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const orderDto = z.object({
  deliveryAddress: z.string().min(5, "Delivery address is too short"),
  scheduledDate: z.coerce.date(),
  items: z
    .array(
      z.object({
        productId: objectIdSchema,
        quantity: z
          .number()
          .int()
          .positive("Quantity must be a positive integer"),
      })
    )
    .min(1, "At least one item is required"),
});
