import React from 'react';
import { User } from '../data/User';
import styled from 'styled-components';
import colors from '../styles/colors';
import { makeStyles } from '@mui/styles';
import ActionButton from './shared/ActionButton';


interface UserCardProps {
    user: User;
    onUpdate: (userId: string) => void;
    onDelete: (userId: string) => void;
    onMakeAdmin: (userId: string) => void;
    animationDelay: string;
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    onUpdate,
    onDelete,
    onMakeAdmin,
    animationDelay,
}) => {

    const isAdminText = user.isAdmin ? 'Yes' : 'No';
    const isAdminBackgroundColor = user.isAdmin ? 'pink' : 'colors.formWhite';

    const cardStyle: React.CSSProperties = {
        animationDelay,
        background: isAdminBackgroundColor,
        borderRadius: '30px',
        border: '1px solid white',
        padding: '30px',
        width: '370px',

    };
    const buttons: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        width: '110px',
    };

    return (

        <div className="user-card" style={cardStyle}>
            <div>
                <p><b>Username :</b> {user.username}</p>
                <p><b>Email :</b> {user.email}</p>
                <p><b>Phone Number : </b>{user.phoneNumber}</p>
                <p><b>Gender :</b> {user.gender}</p>
                <p><b>IsAdmin :</b> {isAdminText}</p>
            </div>
            
            <div style={buttons}>
                <ActionButton
                    title='Update'
                    onClick={() => onUpdate(user._id)}
                />
                <ActionButton
                    title='Delete'
                    onClick={() => onDelete(user._id)}
                />
                <ActionButton
                    title='Make Admin'
                    onClick={() => onMakeAdmin(user._id)}
                />

            </div>
        </div>


    );
};

export default UserCard;
