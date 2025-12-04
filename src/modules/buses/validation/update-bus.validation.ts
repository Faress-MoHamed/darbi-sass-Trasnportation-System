import { z } from "zod";
import { busNumberSchema } from "./bus-number.validation";

// Update bus input validation schema
// All fields are optional for partial updates
export const updateBusSchema = z.object({
    busNumber: busNumberSchema.optional(),

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

    status: z.enum(["active", "maintenance", "stopped"]).optional(),

    gpsTrackerId: z
        .string()
        .max(100, "GPS tracker ID must not exceed 100 characters")
        .optional(),

    maintenanceStatus: z
        .string()
        .max(100, "Maintenance status must not exceed 100 characters")
        .optional(),
});

export type UpdateBusInput = z.infer<typeof updateBusSchema>;

// Validates update bus input data
export function validateUpdateBus(data: unknown) {
    return updateBusSchema.safeParse(data);
}
