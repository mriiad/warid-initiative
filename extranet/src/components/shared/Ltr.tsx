import { ReactNode } from 'react';

/**
 * Isolates LTR-directional data inside the app's RTL layout.
 *
 * A blood group ("O+", "AB-") or a phone number ("+212...") ends or begins
 * with a neutral +/- character. Under `dir=rtl` the Unicode bidi algorithm
 * resolves that neutral to the surrounding paragraph direction and puts it
 * on the wrong visual side: "O+" renders as "+O", "AB+" as "+AB", and
 * "+212612345670" as "212612345670+". On the emergencies screen that sign
 * is exactly what decides donor compatibility, so it has to stay attached
 * to the side it belongs on. See issue #384.
 *
 * <bdi> isolates the run from its surroundings; the explicit dir="ltr"
 * pins the direction instead of leaving it to auto-detection, which for a
 * bare run of digits would still resolve to the ambient RTL.
 */
const Ltr = ({ children, className }: { children: ReactNode; className?: string }) => (
	<bdi dir='ltr' className={className}>
		{children}
	</bdi>
);

export default Ltr;

