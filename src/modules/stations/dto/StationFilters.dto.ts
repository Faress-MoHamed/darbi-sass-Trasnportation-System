import { z } from "zod";
// StationFilters
export const StationFiltersSchema = z.object({
	routeId: z.string().uuid().optional(),
	name: z.string().optional(),
});
export type StationFilters = z.infer<typeof StationFiltersSchema>;
