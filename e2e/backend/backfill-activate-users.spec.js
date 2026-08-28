jest.mock('../../src/models/user', () =>
	require('./support/mongooseMock').makeModelMock()
);

const User = require('../../src/models/user');
const { backfillActivateUsers } = require('../../src/scripts/backfill-activate-users');

describe('backfillActivateUsers', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('sets isActive: true only on accounts that are still inactive', async () => {
		User.updateMany.mockResolvedValue({ modifiedCount: 5 });

		const count = await backfillActivateUsers();

		expect(User.updateMany).toHaveBeenCalledWith(
			{ isActive: false },
			{ $set: { isActive: true } }
		);
		expect(count).toBe(5);
	});

	it('reports zero when every account is already active', async () => {
		User.updateMany.mockResolvedValue({ modifiedCount: 0 });

		const count = await backfillActivateUsers();

		expect(count).toBe(0);
	});
});
