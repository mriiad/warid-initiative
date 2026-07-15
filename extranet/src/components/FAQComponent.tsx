import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	IconButton,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { redesignColors } from '../styles/authRedesign';
import { eventsListRedesignStyles } from '../styles/eventsListRedesign';
import RedesignBottomNav from './shared/RedesignBottomNav';

interface FaqItem {
	question: string;
	answer: string;
}

const useStyles = makeStyles({
	sectionTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '15px',
			color: '#1F1B24',
			marginTop: '8px',
		},
	},
	sectionSubtitle: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: redesignColors.placeholder,
			marginTop: '-8px',
			marginBottom: '4px',
		},
	},
	accordion: {
		borderRadius: '18px !important',
		backgroundColor: '#FFFFFF',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05) !important',
		overflow: 'hidden',
		'&:before': {
			display: 'none',
		},
	},
	summary: {
		'& .MuiAccordionSummary-content': {
			margin: '12px 0',
		},
	},
	question: {
		'&.MuiTypography-root': {
			fontWeight: 600,
			fontSize: '14px',
			color: '#1F1B24',
		},
	},
	details: {
		paddingTop: 0,
		'& .MuiTypography-root': {
			fontSize: '13px',
			color: redesignColors.placeholder,
			lineHeight: 1.6,
		},
	},
});

const FAQComponent: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { screen, topBar, topBarDivider, topBarTitle, content } = eventsListRedesignStyles();
	const { sectionTitle, sectionSubtitle, accordion, summary, question, details } = useStyles();

	const bloodDonationFaq = t('faq.blood', { returnObjects: true }) as FaqItem[];
	const appFaq = t('faq.app', { returnObjects: true }) as FaqItem[];

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('faq.pageTitle')}</Typography>
				<div style={{ width: '40px' }} />
			</div>

			<div className={content}>
				<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
					<Typography className={sectionTitle}>{t('faq.bloodTitle')}</Typography>
					<Typography className={sectionSubtitle}>{t('faq.bloodSubtitle')}</Typography>
				</motion.div>
				{bloodDonationFaq.map((item, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: index * 0.05 }}
					>
						<Accordion className={accordion} disableGutters>
							<AccordionSummary expandIcon={<ExpandMoreIcon />} className={summary}>
								<Typography className={question}>{item.question}</Typography>
							</AccordionSummary>
							<AccordionDetails className={details}>
								<Typography>{item.answer}</Typography>
							</AccordionDetails>
						</Accordion>
					</motion.div>
				))}

				<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
					<Typography className={sectionTitle}>{t('faq.appTitle')}</Typography>
					<Typography className={sectionSubtitle}>{t('faq.appSubtitle')}</Typography>
				</motion.div>
				{appFaq.map((item, index) => (
					<motion.div
						key={`app-${index}`}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: index * 0.05 + 0.3 }}
					>
						<Accordion className={accordion} disableGutters>
							<AccordionSummary expandIcon={<ExpandMoreIcon />} className={summary}>
								<Typography className={question}>{item.question}</Typography>
							</AccordionSummary>
							<AccordionDetails className={details}>
								<Typography>{item.answer}</Typography>
							</AccordionDetails>
						</Accordion>
					</motion.div>
				))}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default FAQComponent;
