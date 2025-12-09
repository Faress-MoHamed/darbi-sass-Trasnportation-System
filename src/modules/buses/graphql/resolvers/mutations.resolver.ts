import { safeResolver } from "../../../../helpers/safeResolver";
import { validateInput } from "../../../../helpers/validateInput";
import { BusService } from "../../buses.service";
import {
	createBusDto,
	updateBusDto,
	deleteBusDto,
	hardDeleteBusDto,
	restoreBusDto,
	updateBusStatusDto,
	activateBusDto,
	deactivateBusDto,
	setMaintenanceDto,
	updateGpsTrackerDto,
	scheduleMaintenanceDto,
	completeMaintenanceDto,
	bulkUpdateStatusDto,
	bulkDeleteDto,
	type CreateBusInput,
	type UpdateBusInput,
	type DeleteBusInput,
	type HardDeleteBusInput,
	type RestoreBusInput,
	type UpdateBusStatusInput,
	type ActivateBusInput,
	type DeactivateBusInput,
	type SetMaintenanceInput,
	type UpdateGpsTrackerInput,
	type ScheduleMaintenanceInput,
	type CompleteMaintenanceInput,
	type BulkUpdateStatusInput,
	type BulkDeleteInput,
} from "../../dto/bus.dto";
export const busMutationsResolvers = {
	createBus: safeResolver(
		async (_, { data }: { data: CreateBusInput }, context) => {
			console.log({ tenantId: context.tenant?.tenantId });
			const validatedData = await validateInput(createBusDto, {
				...data,
				tenantId: context.tenant?.tenantId,
			});
			const busService = new BusService(context.prisma);
			return await busService.createBus(validatedData, validatedData?.tenantId);
		}
	),

	updateBus: safeResolver(async (_, { id, data }: UpdateBusInput, context) => {
		const validatedData = await validateInput(updateBusDto, {
			...data,
			tenantId: context.tenant?.tenantId,
		});
		const busService = new BusService(context.prisma);
		return await busService.updateBus(id, validatedData.data);
	}),

	deleteBus: safeResolver(async (_, { id }: DeleteBusInput, context) => {
		const validatedData = await validateInput(deleteBusDto, { id });
		const busService = new BusService(context.prisma);
		return await busService.deleteBus(validatedData.id);
	}),
	hardDeleteBus: safeResolver(
		async (_, { id }: HardDeleteBusInput, context) => {
			const validatedData = await validateInput(hardDeleteBusDto, { id });

			const busService = new BusService(context.prisma);
			return await busService.hardDeleteBus(validatedData.id);
		}
	),

	restoreBus: safeResolver(async (_, { id }: RestoreBusInput, context) => {
		const validatedData = await validateInput(restoreBusDto, { id });
		const busService = new BusService(context.prisma);
		return await busService.restoreBus(validatedData.id);
	}),

	updateBusStatus: safeResolver(
		async (
			_,
			{ id, status, maintenanceStatus }: UpdateBusStatusInput,
			context
		) => {
			const validatedData = await validateInput(updateBusStatusDto, {
				id,
				status,
				maintenanceStatus,
			});

			const busService = new BusService(context.prisma);
			return await busService.updateBusStatus(
				validatedData.id,
				validatedData.status,
				validatedData.maintenanceStatus
			);
		}
	),

	activateBus: safeResolver(async (_, { id }: ActivateBusInput, context) => {
		const validatedData = await validateInput(activateBusDto, {
			id,
		});
		const busService = new BusService(context.prisma);
		return await busService.activateBus(validatedData.id);
	}),

	deactivateBus: safeResolver(
		async (_, { id }: DeactivateBusInput, context) => {
			const validatedData = await validateInput(deactivateBusDto, {
				id,
			});
			const busService = new BusService(context.prisma);
			return await busService.deactivateBus(validatedData.id);
		}
	),
	setMaintenance: safeResolver(
		async (_, { id, maintenanceStatus }: SetMaintenanceInput, context) => {
			const validatedData = await validateInput(setMaintenanceDto, {
				id,
				maintenanceStatus,
			});
			const busService = new BusService(context.prisma);
			return await busService.setMaintenance(
				validatedData.id,
				validatedData.maintenanceStatus
			);
		}
	),

	updateGpsTracker: safeResolver(
		async (_, { busId, gpsTrackerId }: UpdateGpsTrackerInput, context) => {
			await validateInput(updateGpsTrackerDto, { busId, gpsTrackerId });
			const busService = new BusService(context.prisma);
			return await busService.updateGpsTracker(busId, gpsTrackerId);
		}
	),

	scheduleMaintenance: safeResolver(
		async (
			_,
			{ busId, maintenanceNotes }: ScheduleMaintenanceInput,
			context
		) => {
			await validateInput(scheduleMaintenanceDto, { busId, maintenanceNotes });

			const busService = new BusService(context.prisma);
			return await busService.scheduleMaintenance(busId, maintenanceNotes);
		}
	),

	completeMaintenance: safeResolver(
		async (_, { busId }: CompleteMaintenanceInput, context) => {
			await validateInput(completeMaintenanceDto, { busId });

			const busService = new BusService(context.prisma);
			return await busService.completeMaintenance(busId);
		}
	),

	bulkUpdateStatus: safeResolver(
		async (_, { busIds, status }: BulkUpdateStatusInput, context) => {
			await validateInput(bulkUpdateStatusDto, { busIds, status });
			const busService = new BusService(context.prisma);
			return await busService.bulkUpdateStatus(busIds, status);
		}
	),

	bulkDelete: safeResolver(async (_, { busIds }: BulkDeleteInput, context) => {
		await validateInput(bulkDeleteDto, { busIds });
		const busService = new BusService(context.prisma);
		return await busService.bulkDelete(busIds);
	}),
};
