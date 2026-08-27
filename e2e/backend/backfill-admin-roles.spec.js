jest.mock('../../src/models/user', () =>
	require('./support/mongooseMock').makeModelMock()
);

const User = require('../../src/models/user');
const { backfillAdminRoles } = require('../../src/scripts/backfill-admin-roles');

describe('backfillAdminRoles', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('sets role: principal only on admins with no role field yet', async () => {
		User.updateMany.mockResolvedValue({ modifiedCount: 3 });

		const count = await backfillAdminRoles();

		expect(User.updateMany).toHaveBeenCalledWith(
			{ isAdmin: true, role: { $exists: false } },
			{ $set: { role: 'principal' } }
		);
		expect(count).toBe(3);
	});

	it('reports zero when every admin already has a role', async () => {
		User.updateMany.mockResolvedValue({ modifiedCount: 0 });

		const count = await backfillAdminRoles();

		expect(count).toBe(0);
	});
});
