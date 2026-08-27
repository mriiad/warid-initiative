import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { ADMIN_ROLE_ICONS } from '../../auth/adminAccess';
import { AdminRole } from '../../data/constants';
import colors from '../../styles/colors';
import { authStyles } from '../../styles/mainStyles';

const useStyles = makeStyles({
	paper: {
		background: colors.formWhite,
		borderRadius: '30px',
		border: '1px solid white',
		padding: '20px',
	},
	dialogTitle: {
		textAlign: 'center',
		padding: '16px 24px 8px 24px',
		color: colors.purple,
		fontWeight: 'bold',
		fontSize: '1.5rem',
	},
	roleOption: {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
		padding: '14px 16px',
		marginBottom: '10px',
		border: `1px solid ${colors.purple}33`,
		borderRadius: '16px',
		background: 'none',
		cursor: 'pointer',
		color: colors.purple,
		fontWeight: 600,
		fontSize: '1rem',
		textAlign: 'left',
		'&:hover': {
			backgroundColor: `${colors.purple}11`,
		},
	},
});

interface RolePickerDialogProps {
	open: boolean;
	// Excludes the role the user already holds -- issue #183: "a user
	// already holding a role should not be offered that same role again".
	availableRoles: AdminRole[];
	onSelect: (role: AdminRole) => void;
	onCancel: () => void;
}

// Only the Principal Admin ever renders this -- both call sites
// (UserDetailView, UsersComponent) live entirely behind a Principal-only
// route/self-guard already (issue #183), so there's no separate visibility
// check to duplicate here.
const RolePickerDialog: React.FC<RolePickerDialogProps> = ({
	open,
	availableRoles,
	onSelect,
	onCancel,
}) => {
	const { t } = useTranslation();
	const classes = useStyles();
	const { button } = authStyles();

	return (
		<Dialog
			open={open}
			onClose={onCancel}
			aria-labelledby='role-picker-dialog-title'
			maxWidth='sm'
			fullWidth
			PaperProps={{ className: classes.paper }}
		>
			<DialogTitle id='role-picker-dialog-title' className={classes.dialogTitle}>
				{t('users.list.assignRoleTitle')}
			</DialogTitle>
			<DialogContent>
				{availableRoles.map((role) => {
					const Icon = ADMIN_ROLE_ICONS[role];
					return (
						<button
							key={role}
							type='button'
							className={classes.roleOption}
							onClick={() => onSelect(role)}
						>
							<Icon fontSize='small' />
							{t(`users.role.${role}`)}
						</button>
					);
				})}
			</DialogContent>
			<DialogActions style={{ justifyContent: 'center', paddingBottom: '20px' }}>
				<Button
					onClick={onCancel}
					variant='outlined'
					className={button}
					sx={{
						borderColor: colors.purple,
						color: colors.purple,
						borderRadius: '20px',
						padding: '10px 24px',
						fontWeight: 'bold',
					}}
				>
					{t('common.cancel')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default RolePickerDialog;
