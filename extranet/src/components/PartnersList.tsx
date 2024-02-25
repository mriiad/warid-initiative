import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
	logosContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
		padding: '10px',
	},
	logo: {
		width: '25%',
		margin: '5px',
		height: 'auto',
		objectFit: 'cover',
	},
});

const PartnersList = () => {
	const classes = useStyles();
	const logos = Array.from(
		{ length: 9 },
		(_, i) => `/landing-page/partners/image${i + 1}.png`
	);

	return (
		<Box className={classes.logosContainer}>
			{logos.map((logo, index) => (
				<img
					key={index}
					src={logo}
					alt={`Partner Logo ${index + 1}`}
					className={classes.logo}
				/>
			))}
		</Box>
	);
};

export default PartnersList;
