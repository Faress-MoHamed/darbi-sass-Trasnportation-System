import { z } from "zod";

// CreateStationDto
export const CreateStationDtoSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  routeId: z.string().uuid().optional(),
  sequence: z.number().int().optional(),
});
export type CreateStationDto = z.infer<typeof CreateStationDtoSchema>;

