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
	gender: Gender;
	bloodGroup: BloodGroup;
}

export const fieldDisplayNames: { [K in keyof ProfileFormData]: string } = {
	firstname: 'First Name',
	lastname: 'Last Name',
	birthdate: 'Birthdate',
	gender: 'Gender',
	bloodGroup: 'Blood Group',
};
