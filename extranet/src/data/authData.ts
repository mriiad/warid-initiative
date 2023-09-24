export interface SignupFormData {
	username: string;
	firstName: string;
	lastName: string;
	birthDate: string;
	email: string;
	gender: string;
	password: string;
	phoneNumber: string;
	bloodGroup: string;
	lastDonationDate: string;
	donationType: string;
}

export interface LoginFormData {
	username: string;
	password: string;
}
