import {
    Card,
    CardContent,
    Typography,
    Button
} from '@mui/material';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { Emergency } from '../../data/Emergency';
import colors from '../../styles/colors';

interface EmergencyCardProps {
    emergency: Emergency;
    animationDelay?: string;
    onConfirm: () => void;
}

const useStyles = makeStyles({
    cardContainer: {
        backgroundColor:  `${colors.formWhite} !important`,
        color: 'black',
        width: '300px',
        height: '290px',
        borderRadius: '30px !important',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '5px',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '18px',
    },
});

const EmergencyCard = ({ emergency, animationDelay, onConfirm }: EmergencyCardProps) => {
    const navigate = useNavigate();
    const classes = useStyles();

    const handleMatchedUsers = () => {
        const emergencyId = emergency._id;
        navigate(`/emergencies/${emergencyId}/matched-users`);
    };

    return (
        <Card
            className={classes.cardContainer}
            style={{ animationDelay: animationDelay }}
        >
            <CardContent className={classes.content}>
                <div className={classes.infoRow}>
                    <BloodtypeIcon color="error" />
                    <Typography variant="h6">{emergency.bloodGroup}</Typography>
                </div>

                <div className={classes.infoRow}>
                    <LocationOnIcon color="primary" />
                    <Typography variant="body1">{emergency.city}</Typography>
                </div>

                <div className={classes.infoRow}>
                    <PhoneIcon color="success" />
                    <Typography variant="body1">{emergency.phoneNumber}</Typography>
                </div>

                <div className={classes.infoRow}>
                    <InfoIcon color="action" />
                    <Typography variant="body2">
                        {emergency.details}
                    </Typography>
                </div>

                <div className={classes.actions}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={onConfirm}
                    >
                        Confirm Emergency
                    </Button>
                    <Button
                        variant="outlined"
                        color="info"
                        onClick={handleMatchedUsers}
                    >
                        Matched Users
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default EmergencyCard;
