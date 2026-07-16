import { BloodGroup } from './constants';

export interface Emergency {
	_id: string;
	bloodGroup: BloodGroup;
	city: string;
	phoneNumber: string;
	details: string;
	isConfirmed: boolean;
}
