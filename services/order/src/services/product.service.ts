import productModel from "../models/product.model";
import { productDto } from "../dto/product.dto";
import { deleteFileFromS3 } from "../utils/s3.utils";
import { CreateProductWithFile } from "../types/types";

import { AppError } from "@logitrack/shared";
import { config } from "@logitrack/config";

const bucketName = config.s3.bucketName;

export const createProductService = async ({
  body,
  fileKey,
}: CreateProductWithFile) => {
  const validation = productDto.safeParse(body);

  if (!validation.success) {
    if (fileKey) {
      await deleteFileFromS3(bucketName, fileKey);
    }

    const formattedErrors: Record<string, string> = {};
    (validation.error as any).errors.forEach((err: any) => {
      const field = err.path.join(".");
      formattedErrors[field] = err.message;
    });

    throw { type: "validation", errors: formattedErrors };
  }

  const { name, description, price, stock } = validation.data;

  const newProduct = await productModel.create({
    name,
    description,
    price,
    stock,
    imageUrl: fileKey,
  });

  return newProduct;
};

export const updateProductService = async (
  productId: string,
  body: any,
  filekey?: string
) => {
  // Validate the data
  const validation = productDto.safeParse(body);

  if (!validation.success) {
    if (filekey) {
      await deleteFileFromS3(bucketName, filekey);
    }

    const formattedErrors: Record<string, string> = {};
    (validation.error as any).errors.forEach((err: any) => {
      const field = err.path.join(".");
      formattedErrors[field] = err.message;
    });

    throw { status: 400, errors: formattedErrors };
  }

  const existingProduct = await productModel.findById(productId);
  if (!existingProduct) {
    if (filekey) {
      await deleteFileFromS3(bucketName, filekey);
    }
    throw { status: 404, message: "Product not found" };
  }

  // If a new image is uploaded, delete the old one
  if (filekey && existingProduct.imageUrl) {
    await deleteFileFromS3(bucketName, existingProduct.imageUrl);
  }

  // Update product
  const updatedProduct = await productModel.findByIdAndUpdate(
    productId,
    {
      ...validation.data,
      imageUrl: filekey ? filekey : existingProduct.imageUrl,
    },
    { new: true }
  );

  return updatedProduct;
};

export const getAllProductsService = async () => {
  const products = await productModel.find();
  return products;
};

export const getProductByIdService = async (productId: string) => {
  const product = await productModel.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
};
