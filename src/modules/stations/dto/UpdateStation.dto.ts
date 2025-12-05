import { z } from "zod";
// UpdateStationDto
export const UpdateStationDtoSchema = z.object({
  name: z.string().min(1).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  routeId: z.string().uuid().optional(),
  sequence: z.number().int().optional(),
});
export type UpdateStationDto = z.infer<typeof UpdateStationDtoSchema>;
export interface UpdateStationType {
	name?: string;
	latitude?: number;
	longitude?: number;
	routeId?: string;
	sequence?: number;
}