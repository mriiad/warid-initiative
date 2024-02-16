import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import colors from '../styles/colors';

const useStyles = makeStyles({
	'@font-face': {
		fontFamily: 'MoroccanFont',
		src: `url('/moroccan-font.ttf') format('truetype')`,
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
		marginTop: '32px',
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
		marginBottom: '60px', // Adjust based on navbar height to ensure visibility of the last element
	},
});

const LandingPage: React.FC = () => {
	const {
		imageContainer,
		blockImage,
		textParagraph,
		mainImage,
		avatarImage,
		bigNumber,
		highlightedText,
		marginBottomFix,
		noMargin,
	} = useStyles();

	return (
		<Box>
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
			<p className={`${textParagraph}`}>
				تتراوح أعمارهم بين 18 و27 عاماً
				<br />
				ذوو معرفة ومؤهلات عالية في مختلف المجالات والتخصصات، يجمعهم هدف مشترك
				وهو خدمتكم
			</p>
			<p className={`${textParagraph} ${highlightedText} ${marginBottomFix}`}>
				وأنتم الآن
			</p>
		</Box>
	);
};

export default LandingPage;
