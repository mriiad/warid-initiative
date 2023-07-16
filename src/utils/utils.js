import { IDonation } from '../models/donation';

const isDonor = (donation: IDonation): boolean => donation.disease != undefined;
