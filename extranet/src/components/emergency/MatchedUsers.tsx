import { useEffect, useState } from 'react';
import { 
    Table, 
    TableHead, 
    TableRow, 
    TableCell, 
    TableBody, 
    Button, 
    Chip, 
    Typography, 
    CircularProgress, 
    Box 
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { fetchEmergencyMatchUsers, confirmUserInEmergency } from '../../utils/queries'; 
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext'; 
import SearchOffIcon from '@mui/icons-material/SearchOff'; 

interface MatchedUser {
    user: {
        _id: string;
        phoneNumber: string;
        profile: {
            firstname: string;
            lastname: string;
        };
    };
    isConfirmed: boolean;
}

const useStyles = makeStyles({    
    root: {
        padding: '24px',
    },
    fallBack: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
    noResultsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px'
    },
    noResultsIcon: {
        fontSize: '50px',
        marginRight: '10px'
    },
    title: {
        marginBottom: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%'
    },
    table: {
        minWidth: 400
    },
    actionCell: {
        width: '120px'
    }
});

const MatchedUsers = () => {
    const { emergencyId } = useParams<{ emergencyId: string }>();
    const { token } = useAuth();
    const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true); 
    const classes = useStyles();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchEmergencyMatchUsers(emergencyId, token);
                setMatchedUsers(data.matchingUsers);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false); 
            }
        };

        fetchData();
    }, [emergencyId, token]);

    const handleConfirmUser = async (userId: string) => {
        try {
            await confirmUserInEmergency(emergencyId!, userId, token);
            setMatchedUsers(prevUsers =>
                prevUsers.map(matched =>
                    matched.user._id === userId ? { ...matched, isConfirmed: true } : matched
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={classes.root}>
            {loading ? (
                <Box className={classes.fallBack}>
                    <CircularProgress />
                </Box>
            ) : matchedUsers.length === 0 ? (
                <Box className={classes.noResultsContainer}>
                    <SearchOffIcon className={classes.noResultsIcon} color="action" />
                    <Typography variant="h6" color="textSecondary">
                        No matched users found.
                    </Typography>
                </Box>
            ) : (
                <>
                    <Typography variant="h5" className={classes.title}>
                        Matched Users
                    </Typography>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell className={classes.actionCell}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {matchedUsers.map((matched) => (
                                <TableRow key={matched.user._id}>
                                    <TableCell>{matched.user.profile.firstname}</TableCell>
                                    <TableCell>{matched.user.profile.lastname}</TableCell>
                                    <TableCell>{matched.user.phoneNumber}</TableCell>
                                    <TableCell>
                                        {matched.isConfirmed ? (
                                            <Chip 
                                                label="Contacted" 
                                                color="success" 
                                                variant="outlined"
                                                size="small"
                                            />
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleConfirmUser(matched.user._id)}
                                            >
                                                Confirm
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
        </div>
    );
};

export default MatchedUsers;