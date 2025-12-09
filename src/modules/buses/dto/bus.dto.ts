import { z } from "zod";
import { BusStatus } from "@prisma/client";

// ============================================================================
// Query DTOs
// ============================================================================

export const getBusByIdDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
});

export const getBusByNumberDto = z.object({
	busNumber: z.string().min(1, "Bus number is required"),
});

export const listBusesDto = z.object({
	page: z.number().int().positive().optional(),
	limit: z.number().int().positive().max(100).optional(),
	sortBy: z.string().optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const getBusesByTenantDto = z.object({
	status: z.nativeEnum(BusStatus).optional(),
});

export const getLatestBusLocationDto = z.object({
	busId: z.string().uuid("Invalid bus ID format"),
});

export const getBusGpsHistoryDto = z.object({
	busId: z.string().uuid("Invalid bus ID format"),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
});

export const getActiveTripsByBusDto = z.object({
	busId: z.string().uuid("Invalid bus ID format"),
});

export const getTripHistoryByBusDto = z.object({
	busId: z.string().uuid("Invalid bus ID format"),
	limit: z.number().int().positive().max(100).default(50),
});

export const isBusAvailableDto = z
	.object({
		busId: z.string().uuid("Invalid bus ID format"),
		startTime: z.coerce.date(),
		endTime: z.coerce.date(),
	})
	.refine((data) => data.endTime > data.startTime, {
		message: "End time must be after start time",
		path: ["endTime"],
	});

export const getAvailableBusesDto = z
	.object({
		startTime: z.coerce.date(),
		endTime: z.coerce.date(),
	})
	.refine((data) => data.endTime > data.startTime, {
		message: "End time must be after start time",
		path: ["endTime"],
	});

export const getBusesDueForMaintenanceDto = z.object({
	thresholdKm: z.number().int().positive().optional(),
});

// ============================================================================
// Mutation DTOs
// ============================================================================

export const createBusDto = z.object({
	tenantId: z.string("Invalid tenant ID format"),
	busNumber: z.string().min(1, "Bus number is required"),
	capacity: z.number().int().positive("Capacity must be positive"),
	type: z.string().min(1, "Bus type is required"),
	status: z.nativeEnum(BusStatus).optional(),
	gpsTrackerId: z.string().optional(),
	maintenanceStatus: z.string().optional(),
});

export const updateBusDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
	data: z
		.object({
			tenantId: z.string().uuid("Invalid tenant ID format"),
			busNumber: z.string().min(1).optional(),
			capacity: z.number().int().positive().optional(),
			type: z.string().min(1).optional(),
			status: z.nativeEnum(BusStatus).optional(),
			gpsTrackerId: z.string().optional(),
			maintenanceStatus: z.string().optional(),
		})
		.refine((data) => Object.keys(data).length > 0, {
			message: "At least one field must be provided for update",
		}),
});

export const deleteBusDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
});

export const hardDeleteBusDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
});

export const restoreBusDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
});

export const updateBusStatusDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
	status: z.nativeEnum(BusStatus),
	maintenanceStatus: z.string().optional(),
});

export const activateBusDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
});

export const deactivateBusDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
});

export const setMaintenanceDto = z.object({
	id: z.string().uuid("Invalid bus ID format"),
	maintenanceStatus: z.string().min(1, "Maintenance status is required"),
});

export const updateGpsTrackerDto = z.object({
	busId: z.string().uuid("Invalid bus ID format"),
	gpsTrackerId: z.string().min(1, "GPS tracker ID is required"),
});

export const scheduleMaintenanceDto = z.object({
	busId: z.string().uuid("Invalid bus ID format"),
	maintenanceNotes: z.string().min(1, "Maintenance notes are required"),
});

export const completeMaintenanceDto = z.object({
	busId: z.string().uuid("Invalid bus ID format"),
});

export const bulkUpdateStatusDto = z.object({
	busIds: z.array(z.string().uuid()).min(1, "At least one bus ID is required"),
	status: z.nativeEnum(BusStatus),
});

export const bulkDeleteDto = z.object({
	busIds: z.array(z.string().uuid()).min(1, "At least one bus ID is required"),
});

// ============================================================================
// Type exports
// ============================================================================

export type GetBusByIdInput = z.infer<typeof getBusByIdDto>;
export type GetBusByNumberInput = z.infer<typeof getBusByNumberDto>;
export type ListBusesInput = z.infer<typeof listBusesDto>;
export type GetBusesByTenantInput = z.infer<typeof getBusesByTenantDto>;
export type GetLatestBusLocationInput = z.infer<typeof getLatestBusLocationDto>;
export type GetBusGpsHistoryInput = z.infer<typeof getBusGpsHistoryDto>;
export type GetActiveTripsByBusInput = z.infer<typeof getActiveTripsByBusDto>;
export type GetTripHistoryByBusInput = z.infer<typeof getTripHistoryByBusDto>;
export type IsBusAvailableInput = z.infer<typeof isBusAvailableDto>;
export type GetAvailableBusesInput = z.infer<typeof getAvailableBusesDto>;
export type GetBusesDueForMaintenanceInput = z.infer<
	typeof getBusesDueForMaintenanceDto
>;

export type CreateBusInput = z.infer<typeof createBusDto>;
export type UpdateBusInput = z.infer<typeof updateBusDto>;
export type DeleteBusInput = z.infer<typeof deleteBusDto>;
export type HardDeleteBusInput = z.infer<typeof hardDeleteBusDto>;
export type RestoreBusInput = z.infer<typeof restoreBusDto>;
export type UpdateBusStatusInput = z.infer<typeof updateBusStatusDto>;
export type ActivateBusInput = z.infer<typeof activateBusDto>;
export type DeactivateBusInput = z.infer<typeof deactivateBusDto>;
export type SetMaintenanceInput = z.infer<typeof setMaintenanceDto>;
export type UpdateGpsTrackerInput = z.infer<typeof updateGpsTrackerDto>;
export type ScheduleMaintenanceInput = z.infer<typeof scheduleMaintenanceDto>;
export type CompleteMaintenanceInput = z.infer<typeof completeMaintenanceDto>;
export type BulkUpdateStatusInput = z.infer<typeof bulkUpdateStatusDto>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteDto>;
