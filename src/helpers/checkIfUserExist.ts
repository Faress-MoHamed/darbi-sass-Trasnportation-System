import { PrismaClient } from "@prisma/client";
import { AppError } from "../errors/AppError";

export const CheckIfUserExist = async (userId: any) => {
	const prisma = new PrismaClient();
	const user = await prisma.user.findFirst({
		where: { id: userId },
	});

	if (!user) {
		throw new AppError("this user not found", 404);
	}

	return true;
};
