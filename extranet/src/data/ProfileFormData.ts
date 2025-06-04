export enum BloodGroup {
	None = '',
	APositive = 'A+',
	ANegative = 'A-',
	BPositive = 'B+',
	BNegative = 'B-',
	ABPositive = 'AB+',
	ABNegative = 'AB-',
	OPositive = 'O+',
	ONegative = 'O-',
}

export enum Gender {
	Male = 'male',
	Female = 'female',
}

export interface ProfileFormData {
	firstname: string;
	lastname: string;
	birthdate: string;
	bloodGroup: BloodGroup;
	city: string;
}

export const fieldDisplayNames: { [K in keyof ProfileFormData]: string } = {
	firstname: 'First Name',
	lastname: 'Last Name',
	birthdate: 'Birthdate',
	bloodGroup: 'Blood Group',
	city: 'City',
};

export interface UserFormData {
    firstname: string;
	lastname: string;
	birthdate: string;
	bloodGroup: BloodGroup;
	city: string;
    phoneNumber: string;
	email: string;
}

export const userFieldDisplayNames: { [key in keyof UserFormData]: string } = {
    firstname: 'First Name',
	lastname: 'Last Name',
	birthdate: 'Birthdate',
	bloodGroup: 'Blood Group',
	city: 'City',
    phoneNumber: 'Phone Number',
	email: 'Email',
};
