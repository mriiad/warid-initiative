import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format } from 'date-fns';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DonationComponent from './DonationComponent';

const mutate = vi.fn((_data: any, opts?: { onSuccess?: () => void }) => {
	opts?.onSuccess?.();
});

// Mutable per-test override for the events *list* endpoint (used by the
// "generic event found via the list" fallback branch, distinct from the
// single-event `useEvent` lookup).
let eventsListOverride: any[] = [];

vi.mock('../auth/AuthContext', () => ({
	useAuth: () => ({ token: 'fake-token' }),
}));

vi.mock('../hooks', () => ({
	useDonate: () => ({ mutate }),
	useDonationHistory: () => ({ data: undefined, error: null, isLoading: false, isError: false }),
	useUserProfile: () => ({ data: { data: { bloodGroup: 'O+' } } }),
	useEvents: () => ({ data: { data: { events: eventsListOverride } } }),
	useEvent: (reference: string) => {
		if (reference === GENERIC_EVENT.reference) {
			return { data: { data: { message: 'ok', event: GENERIC_EVENT } } };
		}
		if (reference === SPECIFIC_EVENT.reference) {
			return { data: { data: { message: 'ok', event: SPECIFIC_EVENT } } };
		}
		// Simulates the single-event lookup not having resolved/found
		// anything yet, forcing the "generic event via the list" fallback.
		return { data: undefined };
	},
}));

const GENERIC_EVENT = {
	_id: 'evt-generic-1',
	reference: 'WEVENTGENERIC',
	title: 'Collecte permanente',
	isGeneric: true,
	// Deliberately a date far from "today" -- a generic event's stored date
	// is its creation date, not a date that should ever be shown/used here.
	date: '2020-01-01T00:00:00.000Z',
};

const SPECIFIC_EVENT = {
	_id: 'evt-specific-1',
	reference: 'WEVENT20990815',
	title: 'Collecte de sang - Casablanca',
	isGeneric: false,
	date: '2099-08-15T00:00:00.000Z',
};

const today = format(new Date(), 'yyyy-MM-dd');

beforeEach(() => {
	mutate.mockClear();
	eventsListOverride = [];
});

async function fillDonationTypeAndSubmit() {
	const user = userEvent.setup();
	// The donation-type <Select> has no accessible name; it's the second
	// combobox after the (disabled) blood-group one.
	const comboboxes = screen.getAllByRole('combobox');
	await user.click(comboboxes[1]);
	await user.click(await screen.findByRole('option', { name: 'الدم' }));
	await user.click(screen.getByRole('button', { name: 'تسجيل التبرع' }));
}

function renderAt(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<DonationComponent />
		</MemoryRouter>
	);
}

describe('DonationComponent - general (generic) event date field (issue #201)', () => {
	it('defaults the date to today, not the event\'s own stored date', async () => {
		renderAt(`/donate?eventRef=${GENERIC_EVENT.reference}`);

		const dateInput = (await screen.findByLabelText('تاريخ التبرع')) as HTMLInputElement;
		await waitFor(() => expect(dateInput.value).toBe(today));
	});

	it('keeps the date field read-only (disabled) at all times', async () => {
		renderAt(`/donate?eventRef=${GENERIC_EVENT.reference}`);

		const dateInput = (await screen.findByLabelText('تاريخ التبرع')) as HTMLInputElement;
		// Disabled from the very first render (no "briefly editable" window),
		// and still disabled once the event data has loaded.
		expect(dateInput).toBeDisabled();
		await waitFor(() => expect(dateInput.value).toBe(today));
		expect(dateInput).toBeDisabled();
	});

	it('submits successfully with the correct eventId and today\'s date, without a "date required" error', async () => {
		renderAt(`/donate?eventRef=${GENERIC_EVENT.reference}`);
		await screen.findByLabelText('تاريخ التبرع');
		await waitFor(() =>
			expect((screen.getByLabelText('تاريخ التبرع') as HTMLInputElement).value).toBe(today)
		);

		await fillDonationTypeAndSubmit();

		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
		const [submittedData] = mutate.mock.calls[0];
		expect(submittedData.eventId).toBe(GENERIC_EVENT._id);
		expect(submittedData.donationDate).toBe(today);
		expect(screen.queryByText('تاريخ التبرع مطلوب')).not.toBeInTheDocument();
	});
});

describe('DonationComponent - specific event date field (regression)', () => {
	it('uses the date encoded in the QR link, and is disabled', async () => {
		renderAt(`/donate?eventRef=${SPECIFIC_EVENT.reference}&eventDate=2099-08-15`);

		const dateInput = (await screen.findByLabelText('تاريخ التبرع')) as HTMLInputElement;
		await waitFor(() => expect(dateInput.value).toBe('2099-08-15'));
		expect(dateInput).toBeDisabled();
	});

	it('submits with the correct (non-undefined) eventId', async () => {
		renderAt(`/donate?eventRef=${SPECIFIC_EVENT.reference}&eventDate=2099-08-15`);
		await waitFor(() =>
			expect((screen.getByLabelText('تاريخ التبرع') as HTMLInputElement).value).toBe(
				'2099-08-15'
			)
		);

		await fillDonationTypeAndSubmit();

		await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
		const [submittedData] = mutate.mock.calls[0];
		expect(submittedData.eventId).toBe(SPECIFIC_EVENT._id);
		expect(submittedData.donationDate).toBe('2099-08-15');
	});
});

describe('DonationComponent - generic event resolved via the events list fallback', () => {
	const LISTED_GENERIC_EVENT = {
		_id: 'evt-generic-2',
		reference: 'WEVENTLISTED',
		isGeneric: true,
		date: '2019-05-05T00:00:00.000Z',
	};

	it('also defaults to today and disables the field when found through the list, not the single-event lookup', async () => {
		eventsListOverride = [LISTED_GENERIC_EVENT];
		renderAt(`/donate?eventRef=${LISTED_GENERIC_EVENT.reference}`);

		const dateInput = (await screen.findByLabelText('تاريخ التبرع')) as HTMLInputElement;
		await waitFor(() => expect(dateInput.value).toBe(today));
		expect(dateInput).toBeDisabled();
	});
});

describe('DonationComponent - regular donation (no event reference)', () => {
	it('still defaults the (editable) date field to today', async () => {
		renderAt('/donate');

		const dateInput = (await screen.findByLabelText('تاريخ التبرع')) as HTMLInputElement;
		await waitFor(() => expect(dateInput.value).toBe(today));
		expect(dateInput).not.toBeDisabled();
	});
});
