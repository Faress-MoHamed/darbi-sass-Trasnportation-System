import { AppError } from "../../errors/AppError";

export class AuthErrorService {
	static throwInvalidCredentials(): never {
		throw new AppError("Invalid credentials", 401);
	}

	static throwUserNotFound(): never {
		throw new AppError("User not found", 404);
	}

	static throwUserNotActive(): never {
		throw new AppError("User account is not active", 403);
	}

	static throwAccountBanned(): never {
		throw new AppError("Account has been banned", 403);
	}

	static throwAccountPending(): never {
		throw new AppError("Account is pending activation", 403);
	}

	static throwMaxOtpAttemptsExceeded(): never {
		throw new AppError(
			"Maximum OTP attempts exceeded. Please request a new one.",
			429
		);
	}

	static throwOtpExpired(): never {
		throw new AppError("OTP has expired. Please request a new one.", 400);
	}

	static throwInvalidOtp(): never {
		throw new AppError("Invalid OTP code", 400);
	}

	static throwTenantNotFound(): never {
		throw new AppError("Tenant not found", 404);
	}

	static throwTenantNotActive(): never {
		throw new AppError("Tenant is not active", 403);
	}

	static throwGenericError(message: string) {
		throw new AppError(message, 500);
	}
}
