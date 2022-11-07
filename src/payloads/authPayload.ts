export interface AuthPayload {
	username: string; //cin
	email: string;
	password: string;
	phoneNumber: Number;
}

export interface AuthParams {
	username: string;
	password: string;
}
