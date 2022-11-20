import { BloodGroup, DonationType } from '../utils/enums';

import { model, Schema } from 'mongoose';
/**
 * A person can be either a donor or a patient
 */
export interface IDonation {
	_id: string;
	bloodGroup: BloodGroup;
	lastDonationDate?: Date;
	donationType?: DonationType;
	nextDonationDate?: Date;
	disease?: string;
	userId: Schema.Types.ObjectId;
}

const DonationSchema = new Schema<IDonation>({
	bloodGroup: {
		type: String,
		enum: BloodGroup,
		required: true,
	},
	lastDonationDate: {
		type: Date,
		required: false,
	},
	donationType: {
		type: String,
		enum: DonationType,
		required: false,
	},
	nextDonationDate: {
		type: Date,
		required: false,
	},
	disease: {
		type: String,
		required: false,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

export const Donation = model<IDonation>('Donation', DonationSchema);
