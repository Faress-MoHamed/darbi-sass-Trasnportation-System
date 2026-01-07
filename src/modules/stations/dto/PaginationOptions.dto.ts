import { z } from "zod";
export const orderBySchema = z.object({
	field: z.string(),
	direction: z.enum(["asc", "desc"]),
});
// PaginationOptions
export const PaginationOptionsSchema = z.object({
	page: z.number().int().positive().optional(),
	limit: z.number().int().positive().optional(),
	orderBy: orderBySchema.optional(),
	orderDirection: z.enum(["asc", "desc"]).optional(),
	search: z.string().max(255).optional().nullable(),
});
export type PaginationOptions = z.infer<typeof PaginationOptionsSchema>;

