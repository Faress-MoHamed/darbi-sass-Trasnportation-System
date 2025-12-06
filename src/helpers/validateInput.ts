import type { ZodSchema } from "zod";
import { ValidationError } from "../errors/ValidationError";

/**
 * Validate input with Zod schema
 */
export function validateInput<T>(schema: ZodSchema<T>, data: any): T {
  const validation = schema.safeParse(data);
  if (!validation.success) {
    throw new ValidationError(validation.error, 400);
  }
  return validation.data;
}