const { BLOOD_GROUP_VALUES } = require('./constants');

/**
 * ABO/Rh donor -> recipient compatibility. Keyed by the recipient's blood
 * group, each entry lists every donor blood group that can safely give to
 * that recipient (e.g. O- is a universal donor and appears in every list;
 * AB+ is a universal recipient and accepts from all groups).
 */
const COMPATIBLE_DONOR_BLOOD_GROUPS = {
	'O-': ['O-'],
	'O+': ['O-', 'O+'],
	'A-': ['O-', 'A-'],
	'A+': ['O-', 'O+', 'A-', 'A+'],
	'B-': ['O-', 'B-'],
	'B+': ['O-', 'O+', 'B-', 'B+'],
	'AB-': ['O-', 'A-', 'B-', 'AB-'],
	'AB+': BLOOD_GROUP_VALUES,
};

/**
 * Returns the list of donor blood groups that can safely give blood to a
 * recipient of the given blood group.
 */
const getCompatibleDonorBloodGroups = (recipientBloodGroup) =>
	COMPATIBLE_DONOR_BLOOD_GROUPS[recipientBloodGroup] || [];

module.exports = { COMPATIBLE_DONOR_BLOOD_GROUPS, getCompatibleDonorBloodGroups };
