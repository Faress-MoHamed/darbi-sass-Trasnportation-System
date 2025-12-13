import { prisma } from "../../../lib/prisma";


/**
 * حساب الوقت المتوقع للرحلة بناءً على المسار والمحطات
 * @param routeId - معرف المسار
 * @returns الوقت المتوقع بالدقائق أو null إذا لم يتم العثور على المسار
 */
async function calculateTripEstimatedTime(
	routeId: string
): Promise<number | null> {
	try {
		// جلب بيانات المسار مع المحطات
		const route = await prisma.route.findUnique({
			where: {
				id: routeId,
				deletedAt: null,
			},
			include: {
				stations: {
					where: { deletedAt: null },
					orderBy: { sequence: "asc" },
				},
			},
		});

		if (!route) {
			console.log("Route not found");
			return null;
		}

		// عدد المحطات
		const stationsCount = route.stations.length;

		// وقت التوقف في المحطات (2 دقيقة لكل محطة)
		const stopTimeInMinutes = stationsCount * 2;

		// تحويل estimatedTime من صيغة HH:MM:SS إلى دقائق
		let baseTimeInMinutes = 0;

		if (route.estimatedTime) {
			const timeParts = route.estimatedTime.split(":");
			const hours = parseInt(timeParts[0] || "0", 10);
			const minutes = parseInt(timeParts[1] || "0", 10);
			const seconds = parseInt(timeParts[2] || "0", 10);

			baseTimeInMinutes = hours * 60 + minutes + Math.ceil(seconds / 60);
		}

		// إجمالي الوقت المتوقع
		const totalEstimatedTime = baseTimeInMinutes + stopTimeInMinutes;

		return totalEstimatedTime;
	} catch (error) {
		console.error("Error calculating trip estimated time:", error);
		throw error;
	}
}

/**
 * حساب الوقت المتوقع للرحلة مع تفاصيل إضافية
 * @param routeId - معرف المسار
 * @returns كائن يحتوي على تفاصيل الوقت المتوقع
 */
async function getTripEstimatedTimeDetails(routeId: string) {
	try {
		const route = await prisma.route.findUnique({
			where: {
				id: routeId,
				deletedAt: null,
			},
			include: {
				stations: {
					where: { deletedAt: null },
					orderBy: { sequence: "asc" },
				},
			},
		});

		if (!route) {
			return null;
		}

		const stationsCount = route.stations.length;
		const stopTimeInMinutes = stationsCount * 2;

		let baseTimeInMinutes = 0;
		if (route.estimatedTime) {
			const timeParts = route.estimatedTime.split(":");
			const hours = parseInt(timeParts[0] || "0", 10);
			const minutes = parseInt(timeParts[1] || "0", 10);
			const seconds = parseInt(timeParts[2] || "0", 10);
			baseTimeInMinutes = hours * 60 + minutes + Math.ceil(seconds / 60);
		}

		const totalEstimatedTime = baseTimeInMinutes + stopTimeInMinutes;

		// تحويل الدقائق إلى صيغة HH:MM
		const hours = Math.floor(totalEstimatedTime / 60);
		const minutes = totalEstimatedTime % 60;
		const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}`;

		return {
			routeId: route.id,
			routeName: route.name,
			baseTimeMinutes: baseTimeInMinutes,
			baseTimeFormatted: route.estimatedTime || "00:00:00",
			stationsCount,
			stopTimeMinutes: stopTimeInMinutes,
			totalEstimatedTimeMinutes: totalEstimatedTime,
			totalEstimatedTimeFormatted: formattedTime,
			distanceKm: route.distanceKm
				? parseFloat(route.distanceKm.toString())
				: null,
		};
	} catch (error) {
		console.error("Error getting trip estimated time details:", error);
		throw error;
	}
}

async function calculateArrivalTime(
	routeId: string,
	departureTime: Date
): Promise<Date | null> {
	try {
		const estimatedTimeMinutes = await calculateTripEstimatedTime(routeId);

		if (estimatedTimeMinutes === null) {
			return null;
		}

		// نسخ الـ departureTime عشان منعدلش على الأصلي
		const arrivalTime = new Date(departureTime);

		// إضافة الدقائق المتوقعة
		arrivalTime.setMinutes(arrivalTime.getMinutes() + estimatedTimeMinutes);

		return arrivalTime;
	} catch (error) {
		console.error("Error calculating arrival time:", error);
		throw error;
	}
}

function addMinutesToDate(date: Date, minutes: number): Date {
	const newDate = new Date(date);
	newDate.setMinutes(newDate.getMinutes() + minutes);
	return newDate;
}

async function calculateTripTimings(routeId: string, departureTime: Date) {
	try {
		const details = await getTripEstimatedTimeDetails(routeId);

		if (!details) {
			return null;
		}

		const arrivalTime = addMinutesToDate(
			departureTime,
			details.totalEstimatedTimeMinutes
		);

		return {
			...details,
			departureTime,
			arrivalTime,
			tripDuration: {
				hours: Math.floor(details.totalEstimatedTimeMinutes / 60),
				minutes: details.totalEstimatedTimeMinutes % 60,
				totalMinutes: details.totalEstimatedTimeMinutes,
			},
		};
	} catch (error) {
		console.error("Error calculating trip timings:", error);
		throw error;
	}
}

export {
	calculateTripEstimatedTime,
	getTripEstimatedTimeDetails,
	calculateArrivalTime,
	addMinutesToDate,
	calculateTripTimings,
};
