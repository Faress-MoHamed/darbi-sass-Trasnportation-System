import gql from "graphql-tag";

export const driverEnums = gql`
  enum DriverStatus {
    available
    unavailable
    offline
  }
`;
