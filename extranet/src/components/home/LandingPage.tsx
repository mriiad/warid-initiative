import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLandingPageStyles } from './LandingPageStyles';
import NumbersContainer from './NumbersContainer';
import PartnersList from './PartnersList';
import PhotoGallery from './PhotoGallery';

const LandingPage = () => {
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
		title,
		contentBox,
		textBackgroundContainer,
		gallery,
		partnersContainer,
		noMargin,
	} = useLandingPageStyles();
	const numbersRef = useRef(null);
	const [animatedNumber, setAnimatedNumber] = useState('00000');
	const [startAnimation, setStartAnimation] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setStartAnimation(true);
				}
			},
			{ threshold: 0.5 }
		);

		if (numbersRef.current) {
			observer.observe(numbersRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		if (startAnimation) {
			const targetNumber = 84750;
			const duration = 3000;
			const start = performance.now();

			const animateCount = (now) => {
				const elapsedTime = now - start;
				const progress = Math.min(elapsedTime / duration, 1);
				const currentNumber = Math.floor(progress * targetNumber);

				setAnimatedNumber(currentNumber.toString().padStart(5, '0'));

				if (progress < 1) {
					requestAnimationFrame(animateCount);
				}
			};

			requestAnimationFrame(animateCount);
		}
	}, [startAnimation]);

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
				<p className={`${textParagraph} ${highlightedText} ${title}`}>نحن</p>
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
				<p className={`${textParagraph} ${highlightedText} ${title}`}>
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
				<NumbersContainer animatedNumber={animatedNumber} ref={numbersRef} />
				<div className={gallery}>
					<p className={`${textParagraph} ${highlightedText} ${title}`}>
						معرض الصور
					</p>
					<PhotoGallery />
					<img src='/landing-page/heart.png' alt='Heart' />
				</div>
				<div className={partnersContainer}>
					<p className={`${textParagraph} ${highlightedText} ${title}`}>
						شركاؤنا
					</p>
					<PartnersList />
				</div>
			</Box>
		</Box>
	);
};

export default LandingPage;
