import { z } from "zod";

// Create Route DTO
export const CreateRouteDto = z.object({
	
	name: z.string().min(1, "Route name is required").max(255),
	distanceKm: z.number().positive("Distance must be positive").optional(),
	estimatedTime: z.string().optional(),
	active: z.boolean().default(true),
	stations: z.array(z.string().uuid()).optional(),
});

export type CreateRouteDto = z.infer<typeof CreateRouteDto>;

// Update Route DTO
export const UpdateRouteDto = z.object({
	name: z.string().min(1).max(255).optional(),
	distanceKm: z.number().positive().optional(),
	estimatedTime: z.string().optional(),
	active: z.boolean().optional(),
});

export type UpdateRouteDto = z.infer<typeof UpdateRouteDto>;

// Add Station to Route DTO
export const AddStationToRouteDto = z.object({
	name: z.string().min(1, "Station name is required").max(255),
	latitude: z.number().min(-90).max(90).optional().nullable(),
	longitude: z.number().min(-180).max(180).optional().nullable(),
	sequence: z.number().int().positive().optional(),
});

export type AddStationToRouteDto = z.infer<typeof AddStationToRouteDto>;

// Reorder Stations DTO
export const ReorderStationsDto = z.object({
	stationOrder: z.array(
		z.object({
			stationId: z.string().uuid("Invalid station ID"),
			sequence: z.number().int().positive("Sequence must be positive"),
		})
	),
});

export type ReorderStationsDto = z.infer<typeof ReorderStationsDto>;

// Search Routes DTO
export const SearchRoutesDto = z.object({
	searchTerm: z.string().min(1, "Search term is required"),
	active: z.boolean().optional(),
	skip: z.number().int().nonnegative().default(0),
	take: z.number().int().positive().max(100).default(10),
});

export type SearchRoutesDto = z.infer<typeof SearchRoutesDto>;

// Get Routes With Upcoming Trips DTO
export const GetRoutesWithUpcomingTripsDto = z.object({
	hoursAhead: z.number().int().positive().max(168).default(24), // Max 7 days
});

export type GetRoutesWithUpcomingTripsDto = z.infer<typeof GetRoutesWithUpcomingTripsDto>;

// Route ID Param DTO
export const RouteIdParamDto = z.object({
	routeId: z.string().uuid("Invalid route ID"),
});

export type RouteIdParamDto = z.infer<typeof RouteIdParamDto>;

