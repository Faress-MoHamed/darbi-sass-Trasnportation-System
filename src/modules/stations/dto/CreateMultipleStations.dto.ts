import { z } from "zod";
import { CreateStationDtoSchema } from "./CreateStation.dto";
// CreateMultipleStationsDto
export const CreateMultipleStationsDtoSchema = z.object({
  stations: z.array(CreateStationDtoSchema),
});
export type CreateMultipleStationsDto = z.infer<typeof CreateMultipleStationsDtoSchema>;
