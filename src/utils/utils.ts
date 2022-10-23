import { Donor } from "../models/Donor";

const isDonor = (donor: Donor): boolean => donor.disease != undefined;