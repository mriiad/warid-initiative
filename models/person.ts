import { BloodGroupe, DonationType } from "../utils/enums";

/**
 * A person can be either a donor or a patient
 */
export interface Person {
    id: string;
    cin: string;
    firstName: string;
    lastName: string;
    age: number;
    bloodGroup: BloodGroupe;
    phoneNumber: number;
    email?: string;
    lastDonationDate?: Date;
    donationType?: DonationType;
    nextDonationDate?: Date;
    disease?: string;
}