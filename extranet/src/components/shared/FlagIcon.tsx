import React from 'react';

interface FlagIconProps {
	country: 'morocco' | 'france' | 'uk';
	size?: number;
	className?: string;
}

const FlagIcon: React.FC<FlagIconProps> = ({
	country,
	size = 24,
	className = '',
}) => {
	const getFlagSrc = (countryCode: string) => {
		switch (countryCode) {
			case 'morocco':
				return '/flags/morocco.svg';
			case 'france':
				return '/flags/france.svg';
			case 'uk':
				return '/flags/uk.svg';
			default:
				return '';
		}
	};

	return (
		<img
			src={getFlagSrc(country)}
			alt={`${country} flag`}
			width={size}
			height={size * 0.667}
			className={className}
			style={{ objectFit: 'cover', borderRadius: '2px' }}
		/>
	);
};

export default FlagIcon;
