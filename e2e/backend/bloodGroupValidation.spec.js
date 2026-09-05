// Exercises the real (unmocked) Mongoose schemas -- the rest of the backend
// suite mocks Profile/Emergency entirely, so schema-level validation (like
// the enum on bloodGroup) is never actually exercised anywhere else.
// validateSync() runs schema validation without needing a DB connection.
const mongoose = require('mongoose');
const Profile = require('../../src/models/profile');
const Emergency = require('../../src/models/emergency');

describe('Profile.bloodGroup enum validation', () => {
	it('accepts a valid blood group', () => {
		const profile = new Profile({
			user: new mongoose.Types.ObjectId(),
			city: 'Casablanca',
			bloodGroup: 'AB+',
		});
		expect(profile.validateSync()).toBeUndefined();
	});

	it('rejects an invalid blood group', () => {
		const profile = new Profile({
			user: new mongoose.Types.ObjectId(),
			city: 'Casablanca',
			bloodGroup: 'not-a-blood-group',
		});
		const error = profile.validateSync();
		expect(error.errors.bloodGroup).toBeDefined();
	});
});

describe('Emergency.bloodGroup enum validation', () => {
	it('accepts a valid blood group', () => {
		const emergency = new Emergency({
			bloodGroup: 'O-',
			city: 'Casablanca',
			phoneNumber: 600000000,
		});
		expect(emergency.validateSync()).toBeUndefined();
	});

	it('rejects an invalid blood group', () => {
		const emergency = new Emergency({
			bloodGroup: 'not-a-blood-group',
			city: 'Casablanca',
			phoneNumber: 600000000,
		});
		const error = emergency.validateSync();
		expect(error.errors.bloodGroup).toBeDefined();
	});
});

// Profile.city's enum was silently inert: utils/cities exports the array
// directly (`module.exports = cities`), but profile.js destructured it
// (`const { cities } = require(...)`), so the schema was built with
// `enum: undefined` and accepted anything. Emergency.city imports it
// correctly, and emergency matching compares the two by exact string --
// a profile holding an off-list city can never match. See issue #419.
describe('Profile.city enum validation', () => {
	it('accepts a city from the canonical list', () => {
		const profile = new Profile({
			user: new mongoose.Types.ObjectId(),
			city: 'Casablanca',
			bloodGroup: 'AB+',
		});
		expect(profile.validateSync()).toBeUndefined();
	});

	it('rejects a city that is not on the list', () => {
		const profile = new Profile({
			user: new mongoose.Types.ObjectId(),
			city: 'Gotham City',
			bloodGroup: 'AB+',
		});
		const error = profile.validateSync();
		expect(error.errors.city).toBeDefined();
	});

	it('enforces the same list as Emergency.city', () => {
		expect(Profile.schema.path('city').enumValues).toEqual(
			Emergency.schema.path('city').enumValues
		);
	});
});
