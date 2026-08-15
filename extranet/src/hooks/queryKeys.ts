/**
 * Every React Query key in the app, in one place.
 *
 * Before this, keys were hand-typed array literals scattered across
 * hooks/*.ts, matched by hand again wherever a mutation needed to invalidate
 * something -- nothing checked that a key used for invalidation actually
 * matched the shape a query was cached under. That's how useDashboard's key
 * went unparameterized by userId (fixed here: dashboard(userId) below) even
 * though its backend route is per-user -- it was only ever harmless by
 * accident, because queryClient.clear() runs on every login/logout. See
 * issue #306.
 *
 * `event` (singular, detail) and `events` (plural, list) are genuinely
 * separate key families, not a typo -- they always have been. Invalidating
 * one does not invalidate the other; callers that need both already
 * invalidate both explicitly (see useUpdateEvent/useDeleteEvent). Preserved
 * as-is rather than unified, since that would be a behavioural change bigger
 * than "give every key one place to live."
 *
 * React Query matches invalidateQueries/removeQueries by *prefix* unless
 * `exact: true` is passed -- e.g. invalidating users.all() also invalidates
 * every users.list(page) and users.search(query) entry. The `.all`-style
 * entries below exist specifically to be used that way.
 */
export const queryKeys = {
	user: {
		/** Matches every user.detail() entry too -- prefix invalidation. */
		all: ['user'] as const,
		detail: (userId: string) => ['user', userId] as const,
		me: () => ['user', 'me'] as const,
	},

	users: {
		/** Matches users.list()/users.search() too -- prefix invalidation. */
		all: ['users'] as const,
		list: (page: number) => ['users', page] as const,
		search: (filters: Record<string, string | number | boolean>) =>
			['users', 'search', filters] as const,
	},

	profileComplete: () => ['profileComplete'] as const,

	dashboard: (userId: string) => ['dashboard', userId] as const,

	adminStats: () => ['adminStats'] as const,

	events: {
		/** Matches events.list() too -- prefix invalidation. */
		all: ['events'] as const,
		list: (page: number) => ['events', page] as const,
	},
	/** Separate family from `events` above -- see the module comment. */
	event: {
		detail: (reference: string) => ['event', reference] as const,
	},

	canDonate: () => ['canDonate'] as const,
	donations: () => ['donations'] as const,

	checkParticipation: (reference: string) =>
		['checkParticipation', reference] as const,
	eventParticipants: (reference: string) =>
		['eventParticipants', reference] as const,

	emergencies: {
		unconfirmed: {
			/** Matches unconfirmed.list() too -- prefix invalidation. */
			all: ['emergencies', 'unconfirmed'] as const,
			list: (page: number) => ['emergencies', 'unconfirmed', page] as const,
		},
		/** Matches this emergency's matches() entries too -- prefix invalidation. */
		detail: (emergencyId: string) => ['emergencies', emergencyId] as const,
		matches: (emergencyId: string, page: number) =>
			['emergencies', emergencyId, 'matches', page] as const,
	},
};
