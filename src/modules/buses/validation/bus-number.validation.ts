import { z } from "zod";

// Reusable bus number validation schema
// Bus numbers should be alphanumeric with hyphens/underscores allowed
export const busNumberSchema = z
    .string()
    .min(1, "Bus number is required")
    .max(50, "Bus number must not exceed 50 characters")
    .regex(
        /^[A-Za-z0-9_-]+$/,
        "Bus number must contain only letters, numbers, hyphens, and underscores"
    );
