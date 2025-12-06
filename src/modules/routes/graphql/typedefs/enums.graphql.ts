import gql from "graphql-tag";

export default gql`
	enum BusStatus {
		active
		maintenance
		stopped
	}

	enum DriverStatus {
		available
		unavailable
		offline
	}
`;
