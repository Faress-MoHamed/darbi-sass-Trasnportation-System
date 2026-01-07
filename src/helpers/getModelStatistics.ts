import { Prisma, type PrismaClient } from "@prisma/client";

interface StatConfig {
	label: string;
	query: any;
	format?: (value: any) => string | number;
}

interface ModelStats {
	total: number;
	stats: Array<{
		label: string;
		value: string | number;
	}>;
}

/**
 * Generate statistics for a Prisma model
 * @param prismaModel - The Prisma model delegate (e.g., prisma.user)
 * @param fields - Array of field names to analyze
 * @param customStats - Optional custom statistics configurations
 */
export async function getModelStatistics(
	prismaModel: any,
	fields: string[] = [],
	customStats: StatConfig[] = []
): Promise<ModelStats> {
	const stats: ModelStats = {
		total: 0,
		stats: [],
	};

	// Get total count
	stats.total = await prismaModel.count();
	stats.stats.push({ label: "Total Records", value: stats.total });

	// Generate statistics for each field
	for (const field of fields) {
		// Count non-null values
		const nonNullCount = await prismaModel.count({
			where: {
				[field]: { not: null },
			},
		});
		stats.stats.push({
			label: `${field} (non-null)`,
			value: nonNullCount,
		});

		// For boolean fields, count true/false
		try {
			const trueCount = await prismaModel.count({
				where: { [field]: true },
			});
			stats.stats.push({
				label: `${field} (true)`,
				value: trueCount,
			});
			stats.stats.push({
				label: `${field} (false)`,
				value: stats.total - trueCount,
			});
		} catch (e) {
			// Not a boolean field, continue
		}
	}

	// Execute custom statistics
	for (const customStat of customStats) {
		try {
			const result = await prismaModel.count(customStat.query);
			const value = customStat.format ? customStat.format(result) : result;
			stats.stats.push({
				label: customStat.label,
				value,
			});
		} catch (e) {
			console.error(`Error executing custom stat "${customStat.label}":`, e);
		}
	}

	return stats;
}
