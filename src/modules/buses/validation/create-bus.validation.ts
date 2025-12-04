import { z } from "zod";
import { busNumberSchema } from "./bus-number.validation";

// Create bus input validation schema
export const createBusSchema = z.object({
    // Bus identification
    busNumber: busNumberSchema,

    // Bus specifications
    capacity: z
        .number()
        .int("Capacity must be an integer")
        .positive("Capacity must be a positive number")
        .optional(),

    type: z
        .string()
        .min(2, "Bus type must be at least 2 characters")
        .max(50, "Bus type must not exceed 50 characters")
        .optional(),

    // Status information
    status: z
        .enum(["active", "maintenance", "stopped"])
        .default("stopped")
        .optional(),

    // GPS tracking
    gpsTrackerId: z
        .string()
        .max(100, "GPS tracker ID must not exceed 100 characters")
        .optional(),

    // Maintenance information
    maintenanceStatus: z
        .string()
        .max(100, "Maintenance status must not exceed 100 characters")
        .optional(),
});

export type CreateBusInput = z.infer<typeof createBusSchema>;

// Validates create bus input data
export function validateCreateBus(data: unknown) {
    return createBusSchema.safeParse(data);
}
