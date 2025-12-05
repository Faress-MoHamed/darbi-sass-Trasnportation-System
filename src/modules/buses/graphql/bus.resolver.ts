import { BusService } from "../buses.service";
import { BusStatus } from "@prisma/client";

interface Context {
    prisma: any;
    tenant?: any;
    userId?: string;
    token?: string;
}

export const busResolvers = {
    Query: {
        // Get a single bus by ID
        bus: async (_: any, { id }: { id: string }, context: Context) => {
            const service = new BusService(context.prisma);
            return service.getBusById(id);
        },

        // List buses with optional filters and pagination
        buses: async (
            _: any,
            { filters, pagination }: any,
            context: Context
        ) => {
            const service = new BusService(context.prisma);
            return service.listBuses(filters, pagination);
        },

        // Get bus statistics
        busStatistics: async (
            _: any,
            { busId }: { busId: string },
            context: Context
        ) => {
            const service = new BusService(context.prisma);
            return service.getBusStatistics(busId);
        },
    },

    Mutation: {
        // Create a new bus
        createBus: async (_: any, { input }: any, context: Context) => {
            const service = new BusService(context.prisma);
            // Pass context tenantId - will be used if not provided in input
            const contextTenantId = context.tenant?.tenantId;
            return service.createBus(input, contextTenantId);
        },

        // Update an existing bus
        updateBus: async (
            _: any,
            { id, input }: { id: string; input: any },
            context: Context
        ) => {
            const service = new BusService(context.prisma);
            return service.updateBus(id, input);
        },

        // Update bus status
        updateBusStatus: async (
            _: any,
            { id, status, maintenanceStatus }: { id: string; status: BusStatus; maintenanceStatus?: string },
            context: Context
        ) => {
            const service = new BusService(context.prisma);
            return service.updateBusStatus(id, status, maintenanceStatus);
        },

        // Delete a bus
        deleteBus: async (
            _: any,
            { id }: { id: string },
            context: Context
        ) => {
            const service = new BusService(context.prisma);
            return service.deleteBus(id);
        },
    },
};
