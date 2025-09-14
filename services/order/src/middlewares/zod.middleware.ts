import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateRequest = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      (result.error as any).errors.forEach((err: any) => {
        const field = err.path.join(".");
        formattedErrors[field] = err.message;
      });

      res.status(400).json({ errors: formattedErrors });
      return;
    }

    req.body = result.data;
    next();
  };
};
