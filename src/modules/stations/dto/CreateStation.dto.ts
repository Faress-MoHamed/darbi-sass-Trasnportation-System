import { z } from "zod";

// CreateStationDto
export const CreateStationDtoSchema = z.object({
  name: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  routeId: z.string().optional(),
  sequence: z.number().int().optional(),
});
export type CreateStationDto = z.infer<typeof CreateStationDtoSchema>;

export interface CreateStationType {
	tenantId: string;
	name: string;
	latitude?: number;
	longitude?: number;
	routeId?: string;
	sequence?: number;
}
