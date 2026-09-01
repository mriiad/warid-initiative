/**
 * Isolates an LTR-directional value for places that need a plain string
 * rather than markup -- i18next interpolation, an aria-label, a title.
 * The character-level equivalent of the <Ltr> component
 * (src/components/shared/Ltr.tsx): U+2066 LEFT-TO-RIGHT ISOLATE opens the
 * run and U+2069 POP DIRECTIONAL ISOLATE closes it, so a trailing +/- on a
 * blood group or a leading + on a phone number keeps its side when the
 * surrounding paragraph is RTL. See issue #384.
 */
export const isolateLtr = (value: string) => `\u2066${value}\u2069`;
