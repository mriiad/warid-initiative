/**
 * Design tokens for the redesigned screens.
 *
 * The redesign was rolled out screen by screen, and each screen's style file
 * re-declared the values it needed rather than sharing them. By the end the
 * same card shadow existed in 16 places, `#FFFFFF` was written out 74 times,
 * the primary text colour `#1F1B24` 44 times, and `topBar` was defined
 * independently in six files. Changing the card radius meant editing fifteen
 * files and hoping you caught them all.
 *
 * Every value here is the exact string that was already in use, so adopting a
 * token is a pure substitution -- the generated CSS is unchanged.
 *
 * `redesignColors` in ./authRedesign is built on top of `palette` below and
 * keeps its existing shape, so nothing that imports it has to change.
 */

/** Raw colour values. Prefer the semantic names in `redesignColors`. */
export const palette = {
	rose: '#C56D86',
	roseDark: '#B85D77',
	roseTint: '#FBE4EA',

	white: '#FFFFFF',
	/** Primary text, and the near-black used for dark surfaces. */
	ink: '#1F1B24',
	/** The neutral page background every redesigned screen paints. */
	ground: '#F4F3F6',
	/** Filled/secondary surfaces: icon chips, cancel buttons, empty slots. */
	subtle: '#F1EFF4',
	/** Input and divider borders. */
	border: '#E4E1E6',
	/** Secondary/placeholder text. */
	muted: '#8A8690',

	successGreen: '#A9C97E',
	successGreenHover: '#98BA6C',
	successGreenDisabled: '#D8E5C4',
} as const;

/** Translucent white, for content sitting on the rose header. */
export const onRose = {
	full: palette.white,
	strong: 'rgba(255, 255, 255, 0.85)',
	medium: 'rgba(255, 255, 255, 0.75)',
	soft: 'rgba(255, 255, 255, 0.6)',
	surface: 'rgba(255, 255, 255, 0.25)',
	surfaceSoft: 'rgba(255, 255, 255, 0.22)',
	surfaceFaint: 'rgba(255, 255, 255, 0.18)',
} as const;

/**
 * Corner radii. Eleven distinct values were in use across the style files;
 * these are the ones that actually recur, named by the thing they apply to.
 */
export const radius = {
	/** Icon chips, small square buttons. */
	chip: '12px',
	/** Buttons. */
	button: '14px',
	/** Inputs, and the larger buttons. */
	input: '16px',
	/** Inner cards and list rows. */
	row: '18px',
	/** Top-level cards. */
	card: '20px',
	/** Sheets and bottom-nav bars. */
	sheet: '24px',
	/** The auth card that slides up over the rose header. */
	sheetLarge: '32px',
	pill: '50%',
} as const;

/** The one card shadow the whole redesign uses, plus the two specials. */
export const shadow = {
	card: '0 4px 16px rgba(0, 0, 0, 0.05)',
	none: 'none',
	bottomNav: '0 -4px 20px rgba(0, 0, 0, 0.06)',
} as const;
