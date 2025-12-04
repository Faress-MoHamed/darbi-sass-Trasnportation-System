import { z } from "zod";

export const StationOrderDtoSchema = z.object({
  stationId: z.string().uuid(),
  sequence: z.number().int(),
});
export type StationOrderDto = z.infer<typeof StationOrderDtoSchema>;

// ReorderStationsDto
export const ReorderStationsDtoSchema = z.object({
  routeId: z.string().uuid(),
  stationOrder: z.array(StationOrderDtoSchema),
});
export type ReorderStationsDto = z.infer<typeof ReorderStationsDtoSchema>;

