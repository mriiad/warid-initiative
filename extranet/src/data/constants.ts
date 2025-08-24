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

export const BLOOD_GROUP_VALUES = Object.values(BloodGroup).filter(
	(value) => value !== ''
) as string[];

export const BLOOD_GROUP_OPTIONS = [
	{ value: BloodGroup.APositive, label: 'A+' },
	{ value: BloodGroup.ANegative, label: 'A-' },
	{ value: BloodGroup.BPositive, label: 'B+' },
	{ value: BloodGroup.BNegative, label: 'B-' },
	{ value: BloodGroup.ABPositive, label: 'AB+' },
	{ value: BloodGroup.ABNegative, label: 'AB-' },
	{ value: BloodGroup.OPositive, label: 'O+' },
	{ value: BloodGroup.ONegative, label: 'O-' },
];

export enum Gender {
	Male = 'male',
	Female = 'female',
}
