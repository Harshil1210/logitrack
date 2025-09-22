import productModel from "../models/product.model";
import { productDto } from "../dto/product.dto";
import { deleteFileFromS3 } from "../utils/s3.utils";
import { CreateProductWithFile } from "../types/types";

import { AppError, cacheProduct, getCachedProduct, deleteCache } from "@logitrack/shared";
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

  // Cache the new product
  await cacheProduct(newProduct._id.toString(), newProduct);

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

  // Update cache
  if (updatedProduct) {
    await cacheProduct(productId, updatedProduct);
  }

  return updatedProduct;
};

export const getAllProductsService = async () => {
  // Check cache first
  const cachedProducts = await getCachedProduct('all-products');
  if (cachedProducts) {
    return cachedProducts;
  }

  // Fetch from DB and cache
  const products = await productModel.find();
  await cacheProduct('all-products', products);
  
  return products;
};

export const getProductByIdService = async (productId: string) => {
  // Check cache first
  const cachedProduct = await getCachedProduct(productId);
  if (cachedProduct) {
    return cachedProduct;
  }

  // Fetch from DB
  const product = await productModel.findById(productId);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Cache the product
  await cacheProduct(productId, product);
  
  return product;
};
