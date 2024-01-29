export enum BloodGroup {
	APositive = 'A+',
	ANegative = 'A-',
	BPositive = 'B+',
	BNegative = 'B-',
	ABPositive = 'AB+',
	ABNegative = 'AB-',
	OPositive = 'O+',
	ONegative = 'O-',
}

export interface ProfileFormData {
	firstname: string;
	lastname: string;
	birthdate: string;
	gender: 'male' | 'female';
	bloodGroup: BloodGroup;
}

export const fieldDisplayNames: { [K in keyof ProfileFormData]: string } = {
	firstname: 'First Name',
	lastname: 'Last Name',
	birthdate: 'Birthdate',
	gender: 'Gender',
	bloodGroup: 'Blood Group',
};
