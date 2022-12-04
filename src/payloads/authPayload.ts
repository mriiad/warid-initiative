import { BloodGroup, DonationType, GenderType } from '../utils/enums';

export interface SignupPayload {
	username: string; //cin
	firstName: string;
	lastName: string;
	birthDate: Date;
	gender: GenderType;
	email: string;
	password: string;
	phoneNumber: Number;

	// Donation data
	bloodGroup: BloodGroup;
	lastDonationDate?: Date;
	donationType?: DonationType;
	disease?: string;
}

export interface LoginPayload {
	username: string;
	password: string;
}

export interface VerifyAccountParams {
	confirmationCode: string;
}
