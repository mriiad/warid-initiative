export type Gender = 'male' | 'female';

export interface UserProfile {
	firstname?: string;
	lastname?: string;
	birthdate?: string;
	gender?: Gender;
	bloodGroup?: string;
}

export interface User {
	_id: string;
	username: string;
	email: string;
	phoneNumber: string;
	gender?: Gender;
	isAdmin: boolean;
	profile?: UserProfile;
}
