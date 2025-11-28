import { z } from "zod";

/**
 * Driver license number validation schema
 * Validates alphanumeric format with optional dashes
 * Length: 5-50 characters
 */
export const licenseSchema = z
    .string()
    .min(5, "License number must be at least 5 characters")
    .max(50, "License number must not exceed 50 characters")
    .regex(
        /^[A-Z0-9-]+$/i,
        "License number must contain only letters, numbers, and dashes"
    );

/**
 * Validates license number format
 * @param licenseNumber - License number to validate
 * @returns Validation result
 */
export function validateLicenseFormat(licenseNumber: string) {
    return licenseSchema.safeParse(licenseNumber);
}
