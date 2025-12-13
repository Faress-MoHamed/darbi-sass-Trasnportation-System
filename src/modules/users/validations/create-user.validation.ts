import type { User } from "@prisma/client";
import { z } from "zod";

// ============================================================================
// Base Enums
// ============================================================================

export const UserRoleEnum = z.enum(["SuperAdmin", "admin"]);
export const UserStatus = z.enum(["active", "banned", "pending"]);
export const DriverStatus = z.enum(["available", "unavailable", "offline"]);
export const SubscriptionStatus = z.enum(["active", "expired", "cancelled"]);
export const FieldType = z.enum([
	"text",
	"number",
	"date",
	"file",
	"boolean",
	"select",
]);

// ============================================================================
// Custom Field Value Schema (Dynamic)
// ============================================================================

// Schema for a single custom field value
export const customFieldValueSchema = z.object({
	customFieldId: z.number().int().positive(),
	value: z.string().nullable().optional(),
});

// Helper function to create dynamic custom field validation based on field definitions
export const createCustomFieldValidator = (
	fieldType: string,
	required?: boolean,
	options?: any
) => {
	let fieldSchema: z.ZodTypeAny;

	switch (fieldType) {
		case "text":
			fieldSchema = z.string();
			break;
		case "number":
			fieldSchema = z.string().refine((val) => !isNaN(Number(val)), {
				message: "Must be a valid number",
			});
			break;
		case "date":
			fieldSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
				message: "Must be a valid date",
			});
			break;
		case "file":
			fieldSchema = z.string().url().or(z.string().startsWith("data:"));
			break;
		case "boolean":
			fieldSchema = z
				.string()
				.refine((val) => val === "true" || val === "false", {
					message: "Must be true or false",
				});
			break;
		case "select":
			if (options && Array.isArray(options)) {
				fieldSchema = z.string().refine((val) => options.includes(val), {
					message: `Must be one of: ${options.join(", ")}`,
				});
			} else {
				fieldSchema = z.string();
			}
			break;
		default:
			fieldSchema = z.string();
	}

	return required ? fieldSchema : fieldSchema.optional().nullable();
};

// ============================================================================
// Base User Schema
// ============================================================================

export const createUserBaseSchema = z.object({
	role: UserRoleEnum.nullable(),
	name: z.string().max(150),
	email: z.string().email().max(150).nullable(),
	phone: z.string().max(20),
	password: z.string().nullable(),
	avatar: z.string().max(255).optional().nullable(),
	language: z.string().max(10).optional().nullable(),
	status: UserStatus,
	mustChangePassword: z.boolean().default(true),
	customFields: z.array(customFieldValueSchema).optional(),
});

// ============================================================================
// Driver Schema
// ============================================================================

export const createDriverSchema = z.object({
	// User data
	user: createUserBaseSchema.extend({
		role: z.literal("driver"),
	}),
	// Driver-specific data
	licenseNumber: z.string().max(50).optional().nullable(),
	status: DriverStatus,
	rating: z.number().min(0).max(5).optional().nullable(),
	connected: z.boolean().optional().nullable(),
	customFields: z.array(customFieldValueSchema).optional(),
});

// ============================================================================
// Passenger Schema
// ============================================================================

export const createPassengerSchema = z.object({
	// User data
	user: createUserBaseSchema.extend({
		role: z.literal("passenger"),
	}),
	// Passenger-specific data
	subscriptionStatus: SubscriptionStatus.optional().nullable(),
	pointsBalance: z.number().int().min(0).optional().nullable(),
	customFields: z.array(customFieldValueSchema).optional(),
});

// ============================================================================
// Combined Create Schemas (for API endpoints)
// ============================================================================

export const createUserSchema = createUserBaseSchema;

export const createUserWithRoleSchema = z.discriminatedUnion("role", [
	z.object({
		role: z.literal("driver"),
		data: createDriverSchema,
	}),
	z.object({
		role: z.literal("passenger"),
		data: createPassengerSchema,
	}),
	z.object({
		role: z.union([
			z.literal("SuperAdmin"),
			z.literal("admin"),
			z.literal("supervisor"),
		]),
		data: createUserBaseSchema,
	}),
]);

// ============================================================================
// Runtime Custom Field Validator
// ============================================================================

/**
 * Validates custom fields against their definitions at runtime
 * @param customFields - Array of custom field values from the request
 * @param fieldDefinitions - Array of custom field definitions from the database
 */
export const validateCustomFields = (
	customFields: Array<{ customFieldId: number; value: string | null }>,
	fieldDefinitions: Array<{
		id: number;
		name: string;
		label: string;
		fieldType: string;
		required?: boolean | null;
		options?: any;
	}>
) => {
	const errors: Array<{ fieldId: number; fieldName: string; error: string }> =
		[];

	// Check required fields
	const requiredFields = fieldDefinitions.filter((field) => field.required);
	for (const requiredField of requiredFields) {
		const providedValue = customFields.find(
			(cf) => cf.customFieldId === requiredField.id
		);
		if (!providedValue || !providedValue.value) {
			errors.push({
				fieldId: requiredField.id,
				fieldName: requiredField.name,
				error: `${requiredField.label} is required`,
			});
		}
	}

	// Validate each provided custom field
	for (const customField of customFields) {
		const definition = fieldDefinitions.find(
			(fd) => fd.id === customField.customFieldId
		);

		if (!definition) {
			errors.push({
				fieldId: customField.customFieldId,
				fieldName: "unknown",
				error: "Custom field definition not found",
			});
			continue;
		}

		if (customField.value) {
			const validator = createCustomFieldValidator(
				definition.fieldType,
				definition.required ?? false,
				definition.options
			);

			const result = validator.safeParse(customField.value);
			if (!result.success) {
				errors.push({
					fieldId: customField.customFieldId,
					fieldName: definition.name,
					error: (result.error as any)?.errors?.[0]?.message || "Invalid value",
				});
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

// ============================================================================
// Example Usage Types
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type CreatePassengerInput = z.infer<typeof createPassengerSchema>;
export type CreateUserWithRoleInput = z.infer<typeof createUserWithRoleSchema>;

// ============================================================================
// Helper function to build complete schema with tenant's custom fields
// ============================================================================

/**
 * Dynamically builds a validation schema including custom fields for a specific tenant
 */
export const buildSchemaWithCustomFields = async (
	tenantId: string,
	entityType: "user" | "driver" | "passenger",
	prisma: any // Your Prisma client
) => {
	// Fetch custom field definitions for this tenant
	let customFieldDefinitions;

	switch (entityType) {
		case "user":
			customFieldDefinitions = await prisma.userCustomField.findMany({
				where: { tenantId },
			});
			break;
		case "driver":
			customFieldDefinitions = await prisma.driverCustomField.findMany({
				where: { tenantId },
			});
			break;
		case "passenger":
			customFieldDefinitions = await prisma.passengerCustomField.findMany({
				where: { tenantId },
			});
			break;
	}

	return {
		schema:
			entityType === "driver"
				? createDriverSchema
				: entityType === "passenger"
				? createPassengerSchema
				: createUserSchema,
		customFieldDefinitions,
		validateWithCustomFields: (data: any) => {
			// First validate the base schema
			const baseValidation = (
				entityType === "driver"
					? createDriverSchema
					: entityType === "passenger"
					? createPassengerSchema
					: createUserSchema
			).safeParse(data);

			if (!baseValidation.success) {
				return { success: false, error: baseValidation.error };
			}

			// Then validate custom fields
			const customFieldsData =
				entityType === "driver" || entityType === "passenger"
					? data.customFields
					: data.customFields;

			if (customFieldsData && customFieldDefinitions) {
				const customFieldValidation = validateCustomFields(
					customFieldsData,
					customFieldDefinitions
				);

				if (!customFieldValidation.isValid) {
					return {
						success: false,
						error: {
							name: "CustomFieldValidationError",
							issues: customFieldValidation.errors,
						},
					};
				}
			}

			return { success: true, data: baseValidation.data };
		},
	};
};
