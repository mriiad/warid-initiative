jest.mock('../../src/models/event', () =>
	require('./support/mongooseMock').makeModelMock()
);

const Event = require('../../src/models/event');
const { dropEventImages } = require('../../src/scripts/drop-event-images');

// Issue #461 removed `image` from the Event schema. Removing a field from a
// schema does nothing to documents that already have it, and both read paths
// use .lean() -- which returns the stored document untouched, since Mongoose
// is not hydrating it. So the bytes are still there and still servable; this
// script is what actually removes them.
describe('dropEventImages', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Event.collection = {
			updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
		};
	});

	it('unsets the field only on the events that still have it', async () => {
		Event.collection.updateMany.mockResolvedValue({ modifiedCount: 3 });

		const count = await dropEventImages();

		expect(Event.collection.updateMany).toHaveBeenCalledWith(
			{ image: { $exists: true } },
			{ $unset: { image: '' } }
		);
		expect(count).toBe(3);
	});

	it('is a no-op on a database whose events never had one', async () => {
		const count = await dropEventImages();

		expect(count).toBe(0);
	});

	it('is safe to run twice', async () => {
		Event.collection.updateMany
			.mockResolvedValueOnce({ modifiedCount: 2 })
			.mockResolvedValueOnce({ modifiedCount: 0 });

		expect(await dropEventImages()).toBe(2);
		// The filter is what makes this idempotent: nothing matches the second
		// time, so there is no second write.
		expect(await dropEventImages()).toBe(0);
	});

	it('reports 0 rather than undefined when the driver omits modifiedCount', async () => {
		Event.collection.updateMany.mockResolvedValue({});

		expect(await dropEventImages()).toBe(0);
	});
});
