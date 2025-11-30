import { z } from "zod";

// PaginationOptions
export const PaginationOptionsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  orderBy: z.enum(["name", "sequence", "createdAt"]).optional(),
  orderDirection: z.enum(["asc", "desc"]).optional(),
});
export type PaginationOptions = z.infer<typeof PaginationOptionsSchema>;

