import React from 'react';
import { User } from '../data/User';
import colors from '../styles/colors';
import { makeStyles } from '@mui/styles';
import ActionButton from './shared/ActionButton';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import GenderIcon from '@mui/icons-material/Gesture';

interface UserCardProps {
    user: User;
    onUpdate: (userId: string) => void;
    onDelete: (userId: string) => void;
    onMakeAdmin: (userId: string) => void;
    animationDelay: string;
}

const useStyles = makeStyles({
    userCard: ({ animationDelay, isAdmin }: { animationDelay: string; isAdmin: boolean }) => ({
        background: isAdmin ? 'pink' : colors.formWhite,
        borderRadius: '30px',
        border: '1px solid white',
        padding: '30px',
        width: '370px',
    }),
    userTitle: {
        textAlign: 'center',
        marginBottom: '10px',
    },
    adminIcons: {
        color: 'white',
        backgroundColor: '#78A083',
        borderRadius: '3px',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '3px 7px',
        position: 'absolute',
        right: '60px',

    },
    buttons: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '300px',
        marginTop: '20px',
    },
});

const UserCard: React.FC<UserCardProps> = ({
    user,
    onUpdate,
    onDelete,
    onMakeAdmin,
    animationDelay,
}) => {

    const classes = useStyles({ animationDelay, isAdmin: user.isAdmin });

    return (

        <div className={classes.userCard} >
            <div>
                {user.isAdmin && (
                    <div className={classes.adminIcons}>

                        <span>Admin</span>

                    </div>
                )}

                <Typography variant="h5" className={classes.userTitle}><b>{user.username}</b></Typography>
                <Typography variant="subtitle1"><EmailIcon />{user.email}</Typography>
                <Typography variant="subtitle1"> <PhoneIcon />{user.phoneNumber}</Typography>
                <Typography variant="subtitle1"> <GenderIcon /> {user.gender}</Typography>
            </div>

            <div className={classes.buttons}>
                <ActionButton
                    title='Update'
                    onClick={() => onUpdate(user._id)}
                />
                <ActionButton
                    title='Delete'
                    onClick={() => onDelete(user._id)}
                />

                {!user.isAdmin && (
                    <ActionButton
                        title='Make Admin'
                        onClick={() => onMakeAdmin(user._id)}
                    />
                )}


            </div>
        </div >


    );
};

export default UserCard;
