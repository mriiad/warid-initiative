import { BloodGroup, DonationType } from "../utils/enums";

import { model, Schema } from 'mongoose';
/**
 * A person can be either a donor or a patient
 */

export interface IDonor {
    id: string;
    cin: string;
    firstName: string;
    lastName: string;
    age: number;
    bloodGroup: BloodGroup;
    phoneNumber: number;
    email?: string;
    lastDonationDate?: Date;
    donationType?: DonationType;
    nextDonationDate?: Date;
    disease?: string;
}

const DonorSchema = new Schema<IDonor>({
    cin: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    bloodGroup: {
        type: String,
        enum: BloodGroup,
        required: true
    },
    lastDonationDate: {
        type: Date,
        required: false
    },
    donationType: {
        type: String,
        enum: DonationType,
        required: false
    },
    nextDonationDate: {
        type: Date,
        required: false
    },
    disease: {
        type: String,
        required: false
    }
})

export const Donor = model<IDonor>('Donor', DonorSchema);
