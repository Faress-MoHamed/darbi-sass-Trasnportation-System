// station.utils.ts

import { Prisma } from "@prisma/client";

export const toDecimal = (value?: number | null) =>
	value !== undefined && value !== null ? new Prisma.Decimal(value) : null;
