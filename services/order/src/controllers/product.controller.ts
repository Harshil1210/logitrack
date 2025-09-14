import { Request, Response } from "express";
import { upload } from "../middlewares/upload.middleware";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
} from "../services/product.service";

export const createProduct = async (req: Request, res: Response) => {
  upload.single("image")(req, res, async (err: any) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Image upload failed", error: err.message });
    }

    try {
      const fileKey = (req.file as any)?.key;

      const product = await createProductService({
        body: req.body,
        fileKey,
      });

      return res.status(201).json({ message: "Product created", product });
    } catch (error: any) {
      if (error.type === "validation") {
        return res.status(400).json({ errors: error.errors });
      }

      return res.status(500).json({
        message: "Something went wrong while creating the product",
        error: error.message,
      });
    }
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  upload.single("image")(req, res, async (err: any) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Image upload failed", error: err.message });
    }

    try {
      const fileKey = (req.file as any)?.key;
      const product = await updateProductService(
        req.params.id,
        req.body,
        fileKey
      );
      res
        .status(200)
        .json({ message: "Product updated successfully", product });
    } catch (error: any) {
      if (error.status === 400) {
        return res.status(400).json({ errors: error.errors });
      } else if (error.status === 404) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Something went wrong while updating the product",
        error: error.message,
      });
    }
  });
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await getAllProductsService();
    return res.status(200).json({ products });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const productId = req.params.id;
  try {
    const product = await getProductByIdService(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
