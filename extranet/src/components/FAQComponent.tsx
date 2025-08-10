import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Container, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { bloodDonationFaq, appFaq } from '../utils/faqData';
import colors from '../styles/colors';
import { makeStyles } from '@mui/styles';


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
    },
    extraTopPadding: {
        paddingTop: '20px',
    },
    accordion: {
        marginBottom: '8px',
        borderRadius: '16px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
    },
    summary: {
        backgroundColor: '#f5f5f5',
        fontWeight: 500,
    },
    details: {
        backgroundColor: '#fafafa',
        color: '#6b7280',
    },
    subtitle: {
        fontWeight: 600,
    },
});
const FAQComponent: React.FC = () => {
    const classes = useStyles();

    return (

        <Container maxWidth="md" className={classes.container}>
            <Typography variant="h4" className={classes.heading}>
                FAQ - Blood Donation
            </Typography>
            <Divider sx={{ mb: 4 }} />
            {bloodDonationFaq.map((item, index) => (
                <Accordion key={index} className={classes.accordion}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        className={classes.summary}
                    >
                        <Typography variant="subtitle1" className={classes.subtitle}>{item.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                        <Typography variant="body1">{item.answer}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}

            <Typography variant="h4" className={`${classes.heading} ${classes.extraTopPadding}`}>
                FAQ - Warid App
            </Typography>
            <Divider sx={{ mb: 4 }}  />
            {appFaq.map((item, index) => (
                <Accordion key={`app-${index}`} className={classes.accordion}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        className={classes.summary}
                    >
                        <Typography variant="subtitle1" className={classes.subtitle}>{item.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                        <Typography variant="body1">{item.answer}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}

        </Container>
    );
};

export default FAQComponent;

