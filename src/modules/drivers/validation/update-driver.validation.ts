import { z } from "zod";
import { licenseSchema } from "./license.validation";

// Update driver input validation schema
export const updateDriverSchema = z.object({
    licenseNumber: licenseSchema.optional(),
    vehicleType: z
        .string()
        .min(2, "Vehicle type must be at least 2 characters")
        .max(50, "Vehicle type must not exceed 50 characters")
        .optional(),
    status: z.enum(["available", "unavailable", "offline"]).optional(),
    rating: z
        .number()
        .min(0, "Rating must be at least 0")
        .max(5, "Rating must not exceed 5")
        .optional(),
});

export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;

// Validates update driver input data
export function validateUpdateDriver(data: unknown) {
    return updateDriverSchema.safeParse(data);
}
