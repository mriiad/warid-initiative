import BadgeIcon from '@mui/icons-material/Badge';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import CakeIcon from '@mui/icons-material/Cake';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import GenderIcon from '@mui/icons-material/Wc';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { User } from '../data/User';
import colors from '../styles/colors';
import ActionButton from './shared/ActionButton';

interface UserCardProps {
	user: User;
	onUpdate: (userId: string) => void;
	onDelete: (userId: string) => void;
	onMakeAdmin: (userId: string) => void;
	animationDelay: string;
}

const useStyles = makeStyles({
	userCard: ({
		animationDelay,
		isAdmin,
	}: {
		animationDelay: string;
		isAdmin: boolean;
	}) => ({
		background: isAdmin ? 'pink' : colors.formWhite,
		borderRadius: '30px',
		border: '1px solid white',
		padding: '32px',
		width: '380px',
		margin: '16px',
	}),
	userTitle: {
		textAlign: 'center',
		marginBottom: '12px',
	},
	adminIcons: {
		color: 'white',
		backgroundColor: '#78A083',
		borderRadius: '3px',
		fontSize: '16px',
		fontWeight: 'bold',
		padding: '4px 8px',
		position: 'absolute',
		right: '60px',
	},
	buttons: {
		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'center',
		width: '300px',
		marginTop: '24px',
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

	const fullName = user.profile
		? [user.profile.firstname, user.profile.lastname].filter(Boolean).join(' ')
		: '';
	const age = (() => {
		const birthdate = (user as any).profile?.birthdate;
		if (!birthdate) return undefined;
		const d = new Date(birthdate);
		if (isNaN(d.getTime())) return undefined;
		const today = new Date();
		let a = today.getFullYear() - d.getFullYear();
		const m = today.getMonth() - d.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--;
		return a;
	})();

	const displayGender = (user.gender || (user as any).profile?.gender) as
		| 'male'
		| 'female'
		| undefined;

	const bloodGroup = (user as any).profile?.bloodGroup;

	return (
		<div className={classes.userCard}>
			<div>
				{user.isAdmin && (
					<div className={classes.adminIcons}>
						<span>مشرف</span>
					</div>
				)}

				<Typography variant='h5' className={classes.userTitle}>
					<b>{user.username}</b>
				</Typography>
				{fullName && (
					<Typography variant='subtitle1'>
						<BadgeIcon /> {fullName}
					</Typography>
				)}
				<Typography variant='subtitle1'>
					<EmailIcon />
					{user.email}
				</Typography>
				<Typography variant='subtitle1'>
					{' '}
					<PhoneIcon />
					{user.phoneNumber}
				</Typography>
				{displayGender && (
					<Typography variant='subtitle1'>
						{' '}
						<GenderIcon /> {displayGender}
					</Typography>
				)}
				{typeof age === 'number' && (
					<Typography variant='subtitle1'>
						{' '}
						<CakeIcon /> {age}
					</Typography>
				)}
				{bloodGroup && (
					<Typography variant='subtitle1'>
						{' '}
						<BloodtypeIcon /> {bloodGroup}
					</Typography>
				)}
			</div>

			<div className={classes.buttons}>
				<ActionButton title='تحديث' onClick={() => onUpdate(user._id)} />
				<ActionButton title='حذف' onClick={() => onDelete(user._id)} />

				{!user.isAdmin && (
					<ActionButton
						title='تعيين مشرف'
						onClick={() => onMakeAdmin(user._id)}
					/>
				)}
			</div>
		</div>
	);
};

export default UserCard;
