import productModel from "../models/product.model";
import { deleteCache } from "@logitrack/shared";
import { deleteFileFromS3 } from "../utils/s3.utils";
import { config } from "@logitrack/config";

export const deleteProductService = async (productId: string) => {
  const product = await productModel.findById(productId);
  
  if (!product) {
    throw new Error("Product not found");
  }

  // Delete image from S3 if exists
  if (product.imageUrl) {
    await deleteFileFromS3(config.s3.bucketName, product.imageUrl);
  }

  // Delete from database
  await productModel.findByIdAndDelete(productId);

  // Clear caches
  await deleteCache(`product:${productId}`);
  await deleteCache('product:all-products');

  return { message: "Product deleted successfully" };
};