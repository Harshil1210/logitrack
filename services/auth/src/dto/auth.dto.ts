import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .refine((val) => /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{6,}$/.test(val), {
      message:
        "Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 special character",
    }),
  role: z.enum(["admin", "user"]),
  firstName: z.string().nonempty("firstName is required"),
  lastName: z.string().nonempty("lastName is required"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
  password: z.string().nonempty("Password is required"),
});
