import gql from "graphql-tag";

export const authTypeDefs = gql`
	# Input types
	input LoginInput {
		phone: String!
		password: String
	}
	input VerifyOtpInput {
		phone: String!
		otp: String!
	}
	input RefreshTokenInput {
		refreshToken: String!
	}
	input ForgetPasswordInput {
		phone: String!
	}
	input ResetPasswordInput {
		token: String!
		newPassword: String!
		ConfirmnewPassword: String!
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
		token: String
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
		resendOtp(input: ForgetPasswordInput): ActionResponse
		verifyOtp(input: VerifyOtpInput): ActionResponse
		VerifyPhone(input: VerifyOtpInput): ActionResponse
		resetPassword(input: ResetPasswordInput): ActionResponse
	}
	type Mutation {
		auth: AuthMutations!
	}
`;
