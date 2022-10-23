import { IDonor } from '../models/donor';

const isDonor = (donor: IDonor): boolean => donor.disease != undefined;