import { Prisma } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/client";

export const convertNumberToDecimal = (value: number): Decimal => {
	return new Prisma.Decimal(value);
};

export const convertDecimalToNumber = (value: Decimal | null): number => {
	return value ? value.toNumber() : 0;
};
