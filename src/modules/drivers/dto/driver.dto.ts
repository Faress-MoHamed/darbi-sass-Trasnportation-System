import { DriverStatus } from "@prisma/client";

// Data Transfer Object for creating a new driver
export interface CreateDriverDto {
    tenantId: string;
    name: string;
    phone: string;
    password: string;
    email?: string | null;
    licenseNumber: string;
    vehicleType?: string;
    status?: DriverStatus;
}

// Data Transfer Object for updating an existing driver
export interface UpdateDriverDto {
    licenseNumber?: string;
    vehicleType?: string;
    status?: DriverStatus;
    rating?: number;
}

// Data Transfer Object for driver filters
export interface DriverFiltersDto {
    tenantId?: string; // Filter by tenant
    status?: DriverStatus;
    vehicleType?: string;
    minRating?: number;
    search?: string; // Search by name, phone, or license number
}

// Data Transfer Object for pagination
export interface PaginationDto {
    page?: number;
    limit?: number;
}

// Data Transfer Object for paginated driver response
export interface DriverListDto<T> {
    nodes: T[];
    totalCount: number;
    pageInfo: {
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

// Data Transfer Object for trip history filters
export interface TripHistoryFiltersDto {
    startDate?: Date;
    endDate?: Date;
    status?: string;
}
