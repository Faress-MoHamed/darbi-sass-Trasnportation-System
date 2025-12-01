import { z } from "zod";

// Phone number validation schema
export const phoneSchema = z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(
        /^\+?[1-9]\d{1,14}$/,
        "Invalid phone format. Use international format (e.g., +201234567890)"
    );

// Validates phone number format
export function validatePhoneFormat(phone: string) {
    return phoneSchema.safeParse(phone);
}
