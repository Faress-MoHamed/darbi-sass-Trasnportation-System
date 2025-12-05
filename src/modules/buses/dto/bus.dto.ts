import { BusStatus } from "@prisma/client";

// Data Transfer Object for creating a new bus
export interface CreateBusDto {
    busNumber: string;
    capacity?: number;
    type?: string;
    status?: BusStatus;
    gpsTrackerId?: string;
    maintenanceStatus?: string;
}

// Data Transfer Object for updating an existing bus
export interface UpdateBusDto {
    busNumber?: string;
    capacity?: number;
    type?: string;
    status?: BusStatus;
    gpsTrackerId?: string;
    maintenanceStatus?: string;
}

// Data Transfer Object for bus filters
export interface BusFiltersDto {
    tenantId?: string; // Filter by tenant
    status?: BusStatus;
    type?: string;
    minCapacity?: number;
    maxCapacity?: number;
    search?: string; // Search by bus number or type
}

// Data Transfer Object for pagination
export interface PaginationDto {
    page?: number;
    limit?: number;
}

// Data Transfer Object for paginated bus response
export interface BusListDto<T> {
    nodes: T[];
    totalCount: number;
    pageInfo: {
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
