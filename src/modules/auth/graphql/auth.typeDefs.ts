import gql from "graphql-tag";

export const authTypeDefs = gql`
	# Input types
	input LoginInput {
		phone: String!
		password: String!
	}
	input VerifyOtpInput {
		phone: String!
		otp: String!
	}
	input LoginUserForFirstTimeInput {
		phone: String!
	}
	input RefreshTokenInput {
		refreshToken: String!
	}
	input ForgetPasswordInput {
		phone: String!
	}
	input resetPasswordInput {
		token: String!
		newPassword: String!
		ConfirmnewPassword: String!
	}
	enum UserRole {
		admin
		supervisor
		driver
		passenger
	}

	type User {
		id: String
		name: String
		email: String
		phone: String
		role: UserRole
	}

	type LoginResponse {
		token: String
		refreshToken: String
		user: User
		mustChangePassword: Boolean
	}

	type ActionResponse {
		success: Boolean
		message: String
	}

	type RefreshTokenResponse {
		refreshToken: String
		token: String
	}

	type AuthMutations {
		login(input: LoginInput!): LoginResponse
		logout(token: String!): ActionResponse
		refreshToken(input: RefreshTokenInput): RefreshTokenResponse
		forgetPassword(input: ForgetPasswordInput): ActionResponse
		verifyOtp(input: VerifyOtpInput): ActionResponse
		resetPassword(input: resetPasswordInput): ActionResponse
		LoginUserForFirstTime(input: LoginUserForFirstTimeInput): ActionResponse
	}

	type Mutation {
		Auth: AuthMutations
	}
`;
