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
	// Client-side gate only -- never sent to the backend (see SignupForm's
	// onSubmit), which has no field for it and doesn't ask for it.
	privacyConsent: boolean;
}

export interface LoginFormData {
	username: string;
	password: string;
}
