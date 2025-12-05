# Bus Module

## Overview
The Bus Module manages all bus-related operations in the transportation system. It handles bus registration, profile management, status tracking, GPS tracker association, and statistics.

## Features
- **CRUD Operations**: Complete Create, Read, Update, Delete operations for buses
- **Status Management**: Manages bus operational status (`active`, `maintenance`, `stopped`)
- **GPS Tracking Preparation**: Associates GPS tracker IDs for future tracking integration
- **Multi-tenancy**: Fully supports tenant isolation for all operations
- **Validation**: Enforces unique bus numbers per tenant and comprehensive input validation

## GraphQL API

### Mutations

#### `createBus`
Creates a new bus.
```graphql
mutation CreateBus($input: CreateBusInput!) {
  createBus(input: $input) {
    id
    busNumber
    capacity
    type
    status
    gpsTrackerId
    maintenanceStatus
  }
}
```

**Example Variables:**
```json
{
  "input": {
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "busNumber": "BUS-001",
    "capacity": 50,
    "type": "Standard",
    "status": "active",
    "gpsTrackerId": "GPS-12345"
  }
}
```

#### `updateBus`
Updates bus details.
```graphql
mutation UpdateBus($id: ID!, $input: UpdateBusInput!) {
  updateBus(id: $id, input: $input) {
    id
    busNumber
    capacity
    type
    status
  }
}
```

**Example Variables:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "input": {
    "capacity": 60,
    "type": "Luxury"
  }
}
```

#### `updateBusStatus`
Updates the bus's operational status.
```graphql
mutation UpdateBusStatus($id: ID!, $status: BusStatus!, $maintenanceStatus: String) {
  updateBusStatus(id: $id, status: $status, maintenanceStatus: $maintenanceStatus) {
    id
    status
    maintenanceStatus
  }
}
```

**Example Variables:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "status": "maintenance",
  "maintenanceStatus": "Engine repair scheduled"
}
```

#### `deleteBus`
Deletes a bus. Fails if the bus has active trips.
```graphql
mutation DeleteBus($id: ID!) {
  deleteBus(id: $id)
}
```

### Queries

#### `bus`
Get a single bus by ID.
```graphql
query GetBus($id: ID!) {
  bus(id: $id) {
    id
    busNumber
    capacity
    type
    status
    gpsTrackerId
    maintenanceStatus
  }
}
```

#### `buses`
List buses with pagination and filtering.
```graphql
query ListBuses($filters: BusFilters, $pagination: Pagination) {
  buses(filters: $filters, pagination: $pagination) {
    nodes {
      id
      busNumber
      capacity
      type
      status
    }
    totalCount
    pageInfo {
      currentPage
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
}
```

**Filters:** `tenantId`, `status`, `type`, `minCapacity`, `maxCapacity`, `search` (searches busNumber and type).

**Example Variables:**
```json
{
  "filters": {
    "tenantId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "active",
    "minCapacity": 40
  },
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

#### `busStatistics`
Get performance stats for a bus.
```graphql
query GetBusStats($busId: ID!) {
  busStatistics(busId: $busId) {
    totalTrips
    completedTrips
    activeTrips
  }
}
```

## Data Models

### Bus
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `tenantId` | UUID | Tenant ownership |
| `busNumber` | String | Unique per tenant (required) |
| `capacity` | Int | Passenger capacity (optional) |
| `type` | String | Bus type/category (optional) |
| `status` | Enum | `active`, `maintenance`, `stopped` |
| `gpsTrackerId` | String | GPS tracker identifier (optional) |
| `maintenanceStatus` | String | Maintenance notes/details (optional) |

## Authentication & Authorization

> [!IMPORTANT]
> **Authentication Required**: All bus operations require authentication. The system uses JWT tokens to identify the tenant and user context.

### How It Works
1. Login to get a JWT token
2. Include `Authorization: Bearer <token>` header in all requests
3. The system automatically uses your tenant from the token
4. **No need to provide `tenantId` in the input**

### Getting a Token
First, login to get an authentication token:

```graphql
mutation {
  auth {
    login(input: {
      phone: "YOUR_PHONE"
      password: "YOUR_PASSWORD"
    }) {
      token
      refreshToken
      user {
        id
        name
        role
      }
    }
  }
}
```

Then use the returned `token` in the HTTP Headers for all subsequent requests:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

## Validation Rules
1. **Bus Number**: Must be unique within the tenant. Alphanumeric with hyphens/underscores allowed.
2. **Capacity**: Must be a positive integer if provided.
3. **Type**: Minimum 2 characters if provided.
4. **Deletion**: Cannot delete a bus with active trips.
5. **Status**: Must be one of: `active`, `maintenance`, `stopped`.

## Testing Guide

### Using Apollo Server / GraphQL Playground

#### Step 0: Authenticate First

> [!IMPORTANT]
> You must be authenticated before creating buses. The `tenantId` comes from your JWT token, not from the input.

1. **Login to get a token**:
```graphql
mutation {
  auth {
    login(input: {
      phone: "YOUR_PHONE"
      password: "YOUR_PASSWORD"
    }) {
      token
      user {
        id
        name
      }
    }
  }
}
```

2. **Set the Authorization header** in your GraphQL client:
   - In Apollo Studio/Playground: Go to "Headers" section at the bottom
   - Add: `{"Authorization": "Bearer YOUR_TOKEN_HERE"}`

#### Step 1: Create a Bus

> **Note**: `tenantId` is automatically extracted from your authentication token. You don't need to provide it.

```graphql
mutation {
  createBus(input: {
    busNumber: "BUS-001"
    capacity: 50
    type: "Standard"
    status: active
  }) {
    id
    busNumber
    status
  }
}
```

#### Step 2: List Buses
```graphql
query {
  buses(
    filters: { tenantId: "YOUR_TENANT_ID", status: active }
    pagination: { page: 1, limit: 10 }
  ) {
    nodes {
      id
      busNumber
      capacity
      status
    }
    totalCount
  }
}
```

4. **Update Bus Status**
```graphql
mutation {
  updateBusStatus(
    id: "BUS_ID"
    status: maintenance
    maintenanceStatus: "Routine maintenance"
  ) {
    id
    status
    maintenanceStatus
  }
}
```

5. **Get Bus Statistics**
```graphql
query {
  busStatistics(busId: "BUS_ID") {
    totalTrips
    completedTrips
    activeTrips
  }
}
```

6. **Delete Bus**
```graphql
mutation {
  deleteBus(id: "BUS_ID")
}
```

### Test Scenarios

1. **Uniqueness Validation**: Try creating two buses with the same `busNumber` in the same tenant (should fail)
2. **Tenant Isolation**: Create buses with the same `busNumber` in different tenants (should succeed)
3. **Active Trip Prevention**: Try deleting a bus with active trips (should fail)
4. **Partial Updates**: Update only specific fields (e.g., just capacity)
5. **Search Functionality**: Use the `search` filter to find buses by number or type
6. **Capacity Range**: Filter buses by `minCapacity` and `maxCapacity`
7. **Status Transitions**: Change bus status from `active` → `maintenance` → `stopped`

## Integration

To integrate the Bus module into your GraphQL server:

1. Import the schema and resolvers in your main GraphQL setup:
```typescript
import { busTypeDefs } from './modules/buses/graphql/bus.schema';
import { busResolvers } from './modules/buses/graphql/bus.resolver';
```

2. Add them to your schema and resolver arrays:
```typescript
const typeDefs = [
  // ... other typeDefs
  busTypeDefs,
];

const resolvers = [
  // ... other resolvers
  busResolvers,
];
```
