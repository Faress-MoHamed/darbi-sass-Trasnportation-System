import { PrismaClient } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { prisma } from "../lib/prisma";

export const CheckIfUserExist = async (userId: any) => {
	const user = await prisma.user.findFirst({
		where: { id: userId },
	});

	if (!user) {
		throw new AppError("this user not found", 404);
	}

	return true;
};
