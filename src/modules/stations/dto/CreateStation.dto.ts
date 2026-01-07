import { Decimal } from "@prisma/client/runtime/client";
import { z } from "zod";

// CreateStationDto
export const CreateStationDtoSchema = z.object({
	name: z.string().min(1),
	latitude: z.instanceof(Decimal),
	longitude: z.instanceof(Decimal),
	routeId: z.string().optional(),
	sequence: z.number().int().optional(),
});
export type CreateStationDto = z.infer<typeof CreateStationDtoSchema>;

export interface CreateStationType {
	tenantId: string;
	name: string;
	latitude?: Decimal;
	longitude?: Decimal;
	routeId?: string;
	sequence?: number;
}
