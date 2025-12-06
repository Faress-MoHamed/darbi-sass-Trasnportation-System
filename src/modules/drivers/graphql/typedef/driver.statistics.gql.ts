import gql from "graphql-tag";

export const driverStatistics = gql`
  type DriverStatistics {
    totalTrips: Int!
    completedTrips: Int!
    cancelledTrips: Int!
    activeTrips: Int!
    rating: Float
  }
`;
