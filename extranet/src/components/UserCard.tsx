import React from 'react';
import { User } from '../data/User';
import colors from '../styles/colors';
import { makeStyles } from '@mui/styles';
import ActionButton from './shared/ActionButton';
import Typography from '@mui/material/Typography';

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
    buttons: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '110px',
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
                <Typography variant="subtitle1"><b>Username :</b> {user.username}</Typography>
                <Typography variant="subtitle1"><b>Email :</b> {user.email}</Typography>
                <Typography variant="subtitle1"><b>Phone Number : </b>{user.phoneNumber}</Typography>
                <Typography variant="subtitle1"><b>Gender :</b> {user.gender}</Typography>
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
        </div>


    );
};

export default UserCard;
