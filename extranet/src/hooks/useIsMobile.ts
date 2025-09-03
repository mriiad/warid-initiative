import { useEffect, useState } from 'react';

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const breakpoint = import.meta.env.VITE_MOBILE_MAX_WIDTH || 768;
		const query = `(max-width: ${breakpoint}px)`;

		if (typeof window === 'undefined') return;

		const mediaQuery = window.matchMedia(query);
		setIsMobile(mediaQuery.matches);

		const handleChange = () => setIsMobile(mediaQuery.matches);
		mediaQuery.addEventListener('change', handleChange);

		const handleResize = () => setIsMobile(mediaQuery.matches);
		window.addEventListener('resize', handleResize);

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return isMobile;
};
