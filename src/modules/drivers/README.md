# Driver Module

## Overview
The Driver Module manages all driver-related operations in the transportation system. It handles driver registration (with automatic user creation), profile management, status tracking, and statistics.

## Features
- **Atomic Registration**: Automatically creates both User and Driver records in a single transaction.
- **Role Management**: Automatically assigns the `driver` role to new accounts.
- **Status Tracking**: Manages driver availability (`available`, `unavailable`, `offline`) and connection status.
- **Multi-tenancy**: Fully supports tenant isolation for all operations.
- **Validation**: Enforces unique license numbers per tenant and prevents duplicate user registrations.

## GraphQL API

### Mutations

#### `createDriver`
Creates a new driver and associated user account.

> **Note**: `tenantId` is automatically extracted from your authentication token. You don't need to provide it.

```graphql
mutation CreateDriver($input: CreateDriverInput!) {
  createDriver(input: $input) {
    id
    licenseNumber
    status
    user {
      name
      email
      phone
    }
  }
}
```

**Example Variables:**
```json
{
  "input": {
    "name": "John Doe",
    "phone": "+1234567890",
    "password": "SecurePass123",
    "email": "john@example.com",
    "licenseNumber": "DL123456",
  }
}
```

#### `updateDriver`
Updates driver details (license, vehicle type, rating).
```graphql
mutation UpdateDriver($id: ID!, $input: UpdateDriverInput!) {
  updateDriver(id: $id, input: $input) {
    id
    licenseNumber
  }
}
```

#### `updateDriverStatus`
Updates the driver's operational status.
```graphql
mutation UpdateDriverStatus($id: ID!, $status: DriverStatus!) {
  updateDriverStatus(id: $id, status: $status) {
    id
    status
    connected
  }
}
```

#### `deleteDriver`
Deletes a driver. Fails if the driver has active trips.
```graphql
mutation DeleteDriver($id: ID!) {
  deleteDriver(id: $id)
}
```

### Queries

#### `driver`
Get a single driver by ID.
```graphql
query GetDriver($id: ID!) {
  driver(id: $id) { ... }
}
```

#### `drivers`
List drivers with pagination and filtering.
```graphql
query ListDrivers($filters: DriverFilters, $pagination: Pagination) {
  drivers(filters: $filters, pagination: $pagination) {
    nodes { ... }
    totalCount
  }
}
```
**Filters:** `tenantId`, `status`, `minRating`, `search` (name/phone/license).

#### `driverStatistics`
Get performance stats for a driver.
```graphql
query GetStats($driverId: ID!) {
  driverStatistics(driverId: $driverId) {
    totalTrips
    completedTrips
    rating
  }
}
```

## Authentication & Authorization

> [!IMPORTANT]
> **Authentication Required**: All driver operations require authentication. The `tenantId` is automatically extracted from your JWT token.

### How It Works
1. Login to get a JWT token
2. Include `Authorization: Bearer <token>` header in all requests
3. The system automatically uses your tenant from the token
4. No need to provide `tenantId` in the input

### Getting a Token
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

## Data Models

### Driver
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `userId` | UUID | Link to User record |
| `tenantId` | UUID | Tenant ownership |
| `licenseNumber` | String | Unique per tenant |
| `status` | Enum | `available`, `unavailable`, `offline` |
| `connected` | Boolean | Online status indicator |

### User (Associated)
Drivers are linked to a User record containing:
- Name
- Phone (Unique)
- Email (Unique, Optional)
- Password (Hashed)
- Role (`driver`)

## Validation Rules
1. **License Number**: Must be unique within the tenant.
2. **Phone/Email**: Must be unique across the system.
3. **Deletion**: Cannot delete a driver with active trips.
4. **Status**: Setting status to `available` automatically sets `connected` to `true`.
