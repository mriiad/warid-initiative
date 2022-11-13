export interface SignupPayload {
	username: string; //cin
	email: string;
	password: string;
	phoneNumber: Number;
}

export interface LoginPayload {
	username: string;
	password: string;
}

export interface VerifyAccountParams {
	confirmationCode: string;
}
