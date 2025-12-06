import gql from "graphql-tag";

export const driverTypes = gql`
  type Driver {
    id: ID!
    tenantId: ID!
    userId: ID!
    user: User
    licenseNumber: String
    vehicleType: String
    status: DriverStatus!
    rating: Float
    connected: Boolean
  }
`;
