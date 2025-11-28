import { z } from "zod";
import { licenseSchema } from "./license.validation";

/**
 * Create driver input validation schema
 * Validates all required fields for creating a new driver
 */
export const createDriverSchema = z.object({
    userId: z.string().uuid("Invalid user ID format"),
    tenantId: z.string().uuid("Invalid tenant ID format"),
    licenseNumber: licenseSchema,
    vehicleType: z
        .string()
        .min(2, "Vehicle type must be at least 2 characters")
        .max(50, "Vehicle type must not exceed 50 characters")
        .optional(),
    status: z
        .enum(["available", "unavailable", "offline"])
        .default("offline")
        .optional(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;

/**
 * Validates create driver input data
 * @param data - Driver data to validate
 * @returns Validation result
 */
export function validateCreateDriver(data: unknown) {
    return createDriverSchema.safeParse(data);
}
