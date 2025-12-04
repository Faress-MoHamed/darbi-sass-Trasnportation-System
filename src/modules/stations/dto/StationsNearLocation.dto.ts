import { z } from "zod";

// StationsNearLocationDto
export const StationsNearLocationDtoSchema = z.object({
	latitude: z.number(),
	longitude: z.number(),
	radiusKm: z.number().positive().optional().default(5),
});
export type StationsNearLocationDto = z.infer<
	typeof StationsNearLocationDtoSchema
>;
