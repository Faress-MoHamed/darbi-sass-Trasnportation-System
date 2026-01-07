import * as turf from "@turf/turf";
import { type Station } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { CreateStationType } from "../modules/stations/dto/CreateStation.dto";

export class DistanceService {
	/**
	 * Calculate distance between two points using turf
	 * @param lat1 Latitude of first point
	 * @param lon1 Longitude of first point
	 * @param lat2 Latitude of second point
	 * @param lon2 Longitude of second point
	 * @returns Distance in kilometers
	 */
	getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const from = turf.point([lon1, lat1]);
		const to = turf.point([lon2, lat2]);
		return turf.distance(from, to, { units: "kilometers" });
	}

	/**
	 * Calculate total route distance by summing distances between consecutive stations
	 * @param stations Array of stations ordered by sequence
	 * @returns Total distance in kilometers
	 */
	calculateTotalRouteDistance(stations: CreateStationType[]): number {
		if (stations.length < 2) return 0;

		const stationsWithCoords = stations.filter(
			(s) => s.latitude !== null && s.longitude !== null
		);

		if (stationsWithCoords.length < 2) return 0;

		let totalDistance = 0;

		for (let i = 0; i < stationsWithCoords.length - 1; i++) {
			const current = stationsWithCoords[i];
			const next = stationsWithCoords[i + 1];

			const lat1 = (current.latitude as unknown as Prisma.Decimal).toNumber();
			const lon1 = (current.longitude as unknown as Prisma.Decimal).toNumber();
			const lat2 = (next.latitude as unknown as Prisma.Decimal).toNumber();
			const lon2 = (next.longitude as unknown as Prisma.Decimal).toNumber();

			totalDistance += this.getDistance(lat1, lon1, lat2, lon2);
		}

		return totalDistance;
	}

	/**
	 * Order stations by proximity using greedy algorithm (nearest neighbor)
	 * @param stations Array of stations to order
	 * @returns Ordered array of stations
	 */
	orderStationsByProximity(stations: Station[]): Station[] {
		if (stations.length === 0) return [];

		// Separate stations with valid coordinates from those without
		const stationsWithCoords = stations.filter(
			(s) => s.latitude !== null && s.longitude !== null
		);
		const stationsWithoutCoords = stations.filter(
			(s) => s.latitude === null || s.longitude === null
		);

		// If no station has coordinates, return original list
		if (stationsWithCoords.length === 0) return [...stations];

		// Map to numeric coordinates for distance calculations
		type NumStation = { original: Station; lat: number; lon: number };
		const numericStations: NumStation[] = stationsWithCoords.map((s) => ({
			original: s,
			lat: (s.latitude as unknown as Prisma.Decimal).toNumber(),
			lon: (s.longitude as unknown as Prisma.Decimal).toNumber(),
		}));

		const ordered: Station[] = [];
		const stationsCopy = [...numericStations];

		// Start with the first station
		let current = stationsCopy.shift()!;
		ordered.push(current.original);

		while (stationsCopy.length > 0) {
			let closestIndex = 0;
			let closestDistance = this.getDistance(
				current.lat,
				current.lon,
				stationsCopy[0].lat,
				stationsCopy[0].lon
			);

			for (let i = 1; i < stationsCopy.length; i++) {
				const dist = this.getDistance(
					current.lat,
					current.lon,
					stationsCopy[i].lat,
					stationsCopy[i].lon
				);
				if (dist < closestDistance) {
					closestDistance = dist;
					closestIndex = i;
				}
			}

			current = stationsCopy.splice(closestIndex, 1)[0];
			ordered.push(current.original);
		}

		// Append any stations without coordinates at the end
		return [...ordered, ...stationsWithoutCoords];
	}

	/**
	 * Get distance between two stations
	 * @param station1 First station
	 * @param station2 Second station
	 * @returns Distance in kilometers or null if coordinates are missing
	 */
	getDistanceBetweenStations(
		station1: Station,
		station2: Station
	): number | null {
		if (
			!station1.latitude ||
			!station1.longitude ||
			!station2.latitude ||
			!station2.longitude
		) {
			return null;
		}

		const lat1 = (station1.latitude as unknown as Prisma.Decimal).toNumber();
		const lon1 = (station1.longitude as unknown as Prisma.Decimal).toNumber();
		const lat2 = (station2.latitude as unknown as Prisma.Decimal).toNumber();
		const lon2 = (station2.longitude as unknown as Prisma.Decimal).toNumber();

		return this.getDistance(lat1, lon1, lat2, lon2);
	}


	/**
	 * MAIN HELPER YOU WANT
	 * Returns { distanceKm, estimatedMinutes }
	 */
	getDistanceAndEstimatedTime(stations: CreateStationType[]) {
		const distanceKm = this.calculateTotalRouteDistance(stations);

		// ⚡ configurable average bus speed (km/h)
		const AVERAGE_SPEED = 40; // change as needed

		const estimatedMinutes = Math.round((distanceKm / AVERAGE_SPEED) * 60);

		return {
			distanceKm,
			estimatedMinutes,
		};
	}
}

// Export singleton instance
export const distanceService = new DistanceService();
