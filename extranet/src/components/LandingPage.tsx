import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles({
	imageContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		position: 'relative',
		'& > img': {
			height: '30%',
			position: 'relative',
			zIndex: 1,
		},
		'& > img:nth-of-type(1)': {
			maxWidth: '30%',
			top: '-2px',
			marginRight: '-5%',
		},
		'& > img:nth-of-type(2)': {
			maxWidth: '50%',
			zIndex: 2,
		},
		'& > img:nth-of-type(3)': {
			maxWidth: '30%',
			top: '-6px',
			marginLeft: '-5%',
		},
	},
	blockImage: {
		maxWidth: '80%',
		display: 'block',
		marginTop: '8px',
		marginLeft: 'auto',
		marginRight: 'auto',
	},
});

const LandingPage: React.FC = () => {
	const { imageContainer, blockImage } = useStyles();

	return (
		<Box>
			<div className={imageContainer}>
				<img src='/landing-page/title1.png' alt='Title 1' />
				<img src='/landing-page/title2.png' alt='Title 2' />
				<img src='/landing-page/title3.png' alt='Title 3' />
			</div>
			<img src='/landing-page/title.png' alt='Title' className={blockImage} />
		</Box>
	);
};

export default LandingPage;
