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
