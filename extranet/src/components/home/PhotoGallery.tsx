import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
	galleryContainer: {
		margin: '0 -20px',
		position: 'relative',
		width: '100vw',
		backgroundColor: 'white',
		overflowX: 'scroll',
		display: 'flex',
		gap: '4px',
		padding: '18px 0',
	},
	item: {
		minWidth: '160px',
		height: '120px',
		objectFit: 'cover',
	},
});

const images = [
	'image1.png',
	'image2.png',
	'image3.png',
	'image4.png',
	'image5.png',
	'image6.png',
	'image7.png',
	'image8.png',
	'image9.png',
	'image10.png',
	'image11.png',
	'image12.png',
];

const PhotoGallery = () => {
	const { galleryContainer, item } = useStyles();

	return (
		<Box className={galleryContainer}>
			{images.map((image, index) => (
				<img
					key={index}
					src={`/landing-page/gallery/${image}`}
					alt={`Gallery ${index}`}
					className={item}
				/>
			))}
		</Box>
	);
};

export default PhotoGallery;
