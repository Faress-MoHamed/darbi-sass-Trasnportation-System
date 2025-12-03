import { DriverService } from "../drivers.service";
import { DriverStatus } from "@prisma/client";

interface Context {
    prisma: any;
    tenant?: any;
    userId?: string;
    token?: string;
}

export const driverResolvers = {
    Query: {
        // Get a single driver by ID
        driver: async (_: any, { id }: { id: string }, context: Context) => {
            const service = new DriverService(context.prisma);
            return service.getDriverById(id);
        },

        // Get a driver by user ID
        driverByUserId: async (
            _: any,
            { userId }: { userId: string },
            context: Context
        ) => {
            const service = new DriverService(context.prisma);
            return service.getDriverByUserId(userId);
        },

        // List drivers with optional filters and pagination
        drivers: async (
            _: any,
            { filters, pagination }: any,
            context: Context
        ) => {
            const service = new DriverService(context.prisma);
            return service.listDrivers(filters, pagination);
        },

        // Get driver statistics
        driverStatistics: async (
            _: any,
            { driverId }: { driverId: string },
            context: Context
        ) => {
            const service = new DriverService(context.prisma);
            return service.getDriverStatistics(driverId);
        },

    },

    Mutation: {
        // Create a new driver
        createDriver: async (_: any, { input }: any, context: Context) => {
            const service = new DriverService(context.prisma);
            return service.createDriver(input);
        },

        // Update an existing driver
        updateDriver: async (
            _: any,
            { id, input }: { id: string; input: any },
            context: Context
        ) => {
            const service = new DriverService(context.prisma);
            return service.updateDriver(id, input);
        },

        // Delete a driver
        deleteDriver: async (
            _: any,
            { id }: { id: string },
            context: Context
        ) => {
            const service = new DriverService(context.prisma);
            return service.deleteDriver(id);
        },

        // Update driver status
        updateDriverStatus: async (
            _: any,
            { id, status }: { id: string; status: DriverStatus },
            context: Context
        ) => {
            const service = new DriverService(context.prisma);
            return service.updateDriverStatus(id, status);
        },
    },
};
