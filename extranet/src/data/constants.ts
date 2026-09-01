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

// Meaningful only when isAdmin is true. Mirrors the backend's User.role enum
// (src/models/user.js). See src/auth/adminAccess.ts for how a role is
// checked against a route's allowed roles -- Principal Admin has full
// access to everything, per issue #183.
export enum AdminRole {
	Principal = 'principal',
	Emergency = 'emergency',
	Event = 'event',
}

// Mirrors VALIDATION.PASSWORD_MIN_LENGTH in the backend's
// src/utils/constants.js. The signup form used to hardcode 6 while the
// server accepted 5, and the reset/change-password screens applied no
// minimum at all -- so one value, referenced everywhere. See issue #395.
export const PASSWORD_MIN_LENGTH = 6;
