import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Container,
	Divider,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { motion } from 'framer-motion';
import React from 'react';
import colors from '../styles/colors';
import { appFaq, bloodDonationFaq } from '../utils/faqData';

const useStyles = makeStyles({
	container: {
		paddingBottom: '80px',
		paddingLeft: '16px',
		paddingRight: '32px',
	},
	heading: {
		fontWeight: 'bold',
		color: colors.rose,
		textAlign: 'center',
		marginBottom: '16px',
	},
	headingSubtitle: {
		fontWeight: '500',
		color: 'text.secondary',
		textAlign: 'center',
		marginBottom: '24px',
		fontSize: '1.1rem',
	},
	extraTopPadding: {
		paddingTop: '20px',
	},
	accordion: {
		marginBottom: '12px',
		borderRadius: '20px',
		border: '1px solid rgba(59, 42, 130, 0.12)',
		background:
			'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
		backdropFilter: 'blur(18px)',
		boxShadow: '0 8px 24px rgba(59, 42, 130, 0.12)',
		overflow: 'hidden',
		transition: 'all 0.3s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: '0 16px 32px rgba(59, 42, 130, 0.18)',
			border: `1px solid ${colors.purple}25`,
		},
	},
	summary: {
		background:
			'linear-gradient(135deg, rgba(59, 42, 130, 0.06), rgba(255, 48, 103, 0.06))',
		fontWeight: 600,
		padding: '16px 24px',
		'&:hover': {
			background:
				'linear-gradient(135deg, rgba(59, 42, 130, 0.1), rgba(255, 48, 103, 0.1))',
		},
		'& .MuiAccordionSummary-expandIconWrapper': {
			color: colors.purple,
			transition: 'transform 0.3s ease',
		},
		'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
			transform: 'rotate(180deg)',
		},
	},
	details: {
		backgroundColor: 'transparent',
		color: '#6b7280',
		padding: '0 24px 16px',
		lineHeight: 1.6,
	},
	subtitle: {
		fontWeight: 600,
		color: colors.purple,
		transition: 'color 0.3s ease',
	},
	divider: {
		margin: '24px 0',
		borderColor: 'rgba(59, 42, 130, 0.2)',
	},
});
const FAQComponent: React.FC = () => {
	const {
		container,
		heading,
		headingSubtitle,
		extraTopPadding,
		accordion,
		summary,
		details,
		subtitle,
		divider,
	} = useStyles();

	return (
		<Container maxWidth='md' className={container}>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<Typography variant='h4' className={heading}>
					FAQ - Blood Donation
				</Typography>
				<Typography variant='subtitle1' className={headingSubtitle}>
					Find quick answers to common questions
				</Typography>
			</motion.div>
			<Divider className={divider} />
			{bloodDonationFaq.map((item, index) => (
				<motion.div
					key={index}
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: index * 0.1 }}
				>
					<Accordion className={accordion}>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							className={summary}
						>
							<Typography variant='subtitle1' className={subtitle}>
								{item.question}
							</Typography>
						</AccordionSummary>
						<AccordionDetails className={details}>
							<Typography variant='body1'>{item.answer}</Typography>
						</AccordionDetails>
					</Accordion>
				</motion.div>
			))}

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				<Typography variant='h4' className={`${heading} ${extraTopPadding}`}>
					FAQ - Warid App
				</Typography>
				<Typography variant='subtitle1' className={headingSubtitle}>
					Everything about using the app smoothly
				</Typography>
			</motion.div>
			<Divider className={divider} />
			{appFaq.map((item, index) => (
				<motion.div
					key={`app-${index}`}
					initial={{ opacity: 0, x: 30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: index * 0.1 + 0.7 }}
				>
					<Accordion className={accordion}>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							className={summary}
						>
							<Typography variant='subtitle1' className={subtitle}>
								{item.question}
							</Typography>
						</AccordionSummary>
						<AccordionDetails className={details}>
							<Typography variant='body1'>{item.answer}</Typography>
						</AccordionDetails>
					</Accordion>
				</motion.div>
			))}
		</Container>
	);
};

export default FAQComponent;
