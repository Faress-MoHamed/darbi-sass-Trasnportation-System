import { z } from "zod";

/**
 * Phone number validation schema
 * Validates international phone format with country code
 * Length: 10-15 digits
 */
export const phoneSchema = z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(
        /^\+?[1-9]\d{1,14}$/,
        "Invalid phone format. Use international format (e.g., +201234567890)"
    );

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns Validation result
 */
export function validatePhoneFormat(phone: string) {
    return phoneSchema.safeParse(phone);
}
