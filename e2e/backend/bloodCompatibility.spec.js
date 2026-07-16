const { getCompatibleDonorBloodGroups } = require('../../src/utils/bloodCompatibility');

describe('getCompatibleDonorBloodGroups', () => {
	it('O- (universal donor) is compatible with every recipient blood group', () => {
		const allBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
		allBloodGroups.forEach((recipientBloodGroup) => {
			expect(getCompatibleDonorBloodGroups(recipientBloodGroup)).toContain('O-');
		});
	});

	it('AB+ (universal recipient) accepts donors of every blood group', () => {
		expect(getCompatibleDonorBloodGroups('AB+').sort()).toEqual(
			['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].sort()
		);
	});

	it('O- can only receive from O- donors', () => {
		expect(getCompatibleDonorBloodGroups('O-')).toEqual(['O-']);
	});

	it('an Rh+ recipient accepts both Rh+ and Rh- donors of the same ABO group', () => {
		expect(getCompatibleDonorBloodGroups('A+').sort()).toEqual(['A-', 'A+', 'O-', 'O+'].sort());
	});

	it('an Rh- recipient does not accept Rh+ donors', () => {
		const compatible = getCompatibleDonorBloodGroups('A-');
		expect(compatible).not.toContain('A+');
		expect(compatible).not.toContain('O+');
	});

	it('does not cross ABO groups (A is never compatible with B)', () => {
		expect(getCompatibleDonorBloodGroups('A+')).not.toContain('B+');
		expect(getCompatibleDonorBloodGroups('B+')).not.toContain('A+');
	});

	it('returns an empty list for an unrecognized blood group', () => {
		expect(getCompatibleDonorBloodGroups('invalid')).toEqual([]);
	});
});
