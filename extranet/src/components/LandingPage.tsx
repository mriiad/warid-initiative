import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import colors from '../styles/colors';

const useStyles = makeStyles({
	'@font-face': {
		fontFamily: 'MoroccanFont',
		src: `url('/moroccan-font.ttf') format('truetype')`,
	},
	landingContainer: {
		margin: '0 -19px 55px -19px',
	},
	mainImageContainer: {
		margin: '0 -20px',
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: '15px',
	},
	mainImageBody: {
		width: '28%',
		height: 'auto',
		margin: '0 -12px',
		maxWidth: '100%',
		boxSizing: 'border-box',
		objectFit: 'cover',
	},
	imageContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		position: 'relative',
		'& > img': {
			height: '30%',
			position: 'relative',
			zIndex: 1,
			opacity: 0,
			animation: '$slideIn 0.5s ease-out forwards',
		},
		'& > img:nth-of-type(1)': {
			maxWidth: '30%',
			top: '-2px',
			marginRight: '-5%',
			animationDelay: '0.5s',
		},
		'& > img:nth-of-type(2)': {
			maxWidth: '50%',
			zIndex: 2,
			animationDelay: '1s',
		},
		'& > img:nth-of-type(3)': {
			maxWidth: '30%',
			top: '-6px',
			marginLeft: '-5%',
			animationDelay: '1.5s',
		},
	},
	blockImage: {
		maxWidth: '80%',
		display: 'block',
		marginTop: '8px',
		marginLeft: 'auto',
		marginRight: 'auto',
		opacity: 0,
		animation: '$fadeInUp 0.5s ease-out forwards',
		animationDelay: '2s',
	},
	textParagraph: {
		fontFamily: 'MoroccanFont',
		textAlign: 'center',
		fontSize: '24px',
		color: colors.purple,
		marginTop: '60px',
		opacity: 0,
		animation: '$fadeInUp 0.5s ease-out forwards',
		animationDelay: '2.5s',
	},
	highlightedText: {
		color: colors.rose,
		fontWeight: 600,
		marginTop: '20px',
	},
	mainImage: {
		display: 'block',
		maxWidth: '80%',
		height: 'auto',
		marginLeft: 'auto',
		marginRight: 'auto',
		marginTop: '-42px',
		opacity: 0,
		animation: '$fadeInUp 0.5s ease-out forwards',
		animationDelay: '3s',
	},
	avatarImage: {
		maxWidth: '20%',
		marginTop: '20px',
		marginBottom: '8px',
	},
	bigNumber: {
		margin: 0,
		fontSize: '48px',
		color: colors.purple,
		fontWeight: 600,
	},
	contentBox: {
		backgroundImage: 'url(/landing-page/main_background.png)',
		backgroundSize: 'cover',
		width: '100%',
		padding: '20px',
		boxSizing: 'border-box',
		marginTop: '50px',
	},
	textBackgroundContainer: {
		width: '180px',
		height: '72px',
		margin: 'auto',
		'& > img': {
			position: 'relative',
			zIndex: 1,
			width: '20%',
			height: 'auto',
			display: 'block',
			marginLeft: 'auto',
			marginRight: 'auto',
			marginBottom: '-30px',
		},
		'& > div': {
			height: '48px',
			display: 'flex',
			borderRadius: '16px',
			backgroundColor: colors.purple,
			alignItems: 'center',
			justifyContent: 'center',
			position: 'relative',
			top: '20px',
			'& > p': {
				fontFamily: 'MoroccanFont',
				fontSize: '24px',
				color: 'white',
			},
		},
	},

	numberBackground: {
		padding: '5px',
		height: '110px',
		color: 'white',
		margin: '0 3px',
		display: 'inline-flex',
		fontSize: '77px',
		minWidth: '72px',
		textAlign: 'center',
		alignItems: 'center',
		fontWeight: 'bold',
		borderRadius: '40px',
		justifyContent: 'center',
		backgroundColor: colors.purple,
		fontFamily: '"Digital Numbers", sans-serif',
		boxShadow: '-2px -4px 0px 0px #3b2a8261',
	},
	numbersContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		margin: '24px 0',
	},
	noMargin: { margin: 0 },
	'@keyframes slideIn': {
		from: {
			transform: 'translateX(100%)',
			opacity: 0,
		},
		to: {
			transform: 'translateX(0)',
			opacity: 1,
		},
	},
	'@keyframes fadeInUp': {
		from: {
			transform: 'translateY(20px)',
			opacity: 0,
		},
		to: {
			transform: 'translateY(0)',
			opacity: 1,
		},
	},
	marginBottomFix: {
		marginBottom: '60px',
	},
});

const LandingPage: React.FC = () => {
	const {
		landingContainer,
		mainImageContainer,
		mainImageBody,
		imageContainer,
		blockImage,
		textParagraph,
		mainImage,
		avatarImage,
		bigNumber,
		highlightedText,
		marginBottomFix,
		contentBox,
		textBackgroundContainer,
		numberBackground,
		numbersContainer,
		noMargin,
	} = useStyles();

	const donorsTotal = ['8', '4', '7', '5', '0'];

	return (
		<Box className={landingContainer}>
			<div className={imageContainer}>
				<img src='/landing-page/title1.png' alt='Title 1' />
				<img src='/landing-page/title2.png' alt='Title 2' />
				<img src='/landing-page/title3.png' alt='Title 3' />
			</div>
			<img src='/landing-page/title.png' alt='Title' className={blockImage} />
			<p className={textParagraph}>
				جمعية مغربية غرضها الرئيسي تحسيس الناس بأهمية التبرع الدوري وتزويد بنك
				الدم المحلي بكميات كافية من أكياس الدم من أجل مساعدة مرضى السرطان
			</p>
			<Box className={contentBox}>
				<img
					src='/landing-page/main1.png'
					alt='Warid Team'
					className={mainImage}
				/>
				<p className={`${textParagraph} ${highlightedText}`}>نحن</p>
				<img
					src='/landing-page/avatar.png'
					alt='Main Visual'
					className={`${mainImage} ${avatarImage}`}
				/>
				<p className={`${textParagraph} ${bigNumber}`}>100</p>
				<p className={`${textParagraph} ${highlightedText} ${noMargin}`}>
					متطوع ومتطوعة
				</p>
				<p className={textParagraph}>
					تتراوح أعمارهم بين 18 و27 عاماً
					<br />
					ذوو معرفة ومؤهلات عالية في مختلف المجالات والتخصصات، يجمعهم هدف مشترك
					وهو خدمتكم
				</p>
				<p className={`${textParagraph} ${highlightedText} ${marginBottomFix}`}>
					وأنتم الآن
				</p>
				<div className={mainImageContainer}>
					<img
						src='/landing-page/donor1.png'
						alt='Donor 1'
						className={mainImageBody}
					/>
					<img
						src='/landing-page/donor2.png'
						alt='Donor 2'
						className={mainImageBody}
					/>
					<img
						src='/landing-page/donor3.png'
						alt='Donor 3'
						className={mainImageBody}
					/>
					<img
						src='/landing-page/donor4.png'
						alt='Donor 4'
						className={mainImageBody}
					/>
				</div>
				<div className={textBackgroundContainer}>
					<img
						src='/landing-page/heart-with-background.png'
						alt='Heart with background'
					/>
					<div>
						<p>متبرع دوري</p>
					</div>
				</div>
				<div className={numbersContainer}>
					{donorsTotal.map((number, index) => (
						<Box key={index} className={numberBackground}>
							{number}
						</Box>
					))}
				</div>
			</Box>
		</Box>
	);
};

export default LandingPage;
