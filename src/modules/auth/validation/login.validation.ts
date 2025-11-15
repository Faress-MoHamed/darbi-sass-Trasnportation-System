import { z } from "zod";

export const loginSchema = z.object({
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 characters") // adjust min length as needed
    .max(20, "Phone number must be at most 20 characters")
    .regex(/^\+?\d+$/, "Phone number must contain only digits and optional leading +"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});
