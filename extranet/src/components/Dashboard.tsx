import { useDashboard } from '@/hooks/useUsers';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import OpacityIcon from '@mui/icons-material/Opacity';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import colors from '../styles/colors';

const useStyles = makeStyles({
	heroCard: {
		background: `linear-gradient(135deg, ${colors.purple}, ${colors.darkPurple})`,
		color: 'white',
		borderRadius: '24px',
		padding: '20px',
		position: 'relative',
		overflow: 'hidden',
	},
	heroContent: {
		position: 'relative',
		zIndex: 1,
	},
	heroOverlay: {
		position: 'absolute',
		inset: 0,
		background:
			'radial-gradient(800px 200px at 10% -10%, rgba(255,255,255,0.15), transparent), radial-gradient(600px 200px at 90% 110%, rgba(255,255,255,0.12), transparent)',
		pointerEvents: 'none',
		zIndex: 0,
	},
	heroButton: {
		marginTop: '12px',
		color: '#fff',
		backgroundColor: 'rgba(255,255,255,0.18)',
		backdropFilter: 'blur(6px)',
		'&:hover': { backgroundColor: 'rgba(255,255,255,0.28)' },
	},
	statCard: {
		borderRadius: '24px',
		padding: '20px',
		textAlign: 'center',
		background:
			'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
		backdropFilter: 'blur(18px)',
		border: '1px solid rgba(59, 42, 130, 0.12)',
		boxShadow: '0 8px 24px rgba(59, 42, 130, 0.08)',
		transition: 'all 0.3s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			border: `1px solid ${colors.purple}30`,
			boxShadow: '0 16px 40px rgba(59, 42, 130, 0.16)',
		},
	},
	statIcon: {
		width: 56,
		height: 56,
		backgroundColor: 'transparent',
		background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.darkPurple} 100%)`,
		color: 'white',
		boxShadow: '0 6px 14px rgba(59, 42, 130, 0.25)',
	},
	donationCard: {
		borderRadius: '24px',
		padding: '20px',
		background:
			'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
		backdropFilter: 'blur(18px)',
		border: '1px solid rgba(59, 42, 130, 0.12)',
		boxShadow: '0 8px 24px rgba(59, 42, 130, 0.08)',
		transition: 'all 0.3s ease',
		'&:hover': {
			border: `1px solid ${colors.purple}30`,
			boxShadow: '0 16px 40px rgba(59, 42, 130, 0.16)',
		},
	},
	emptyState: {
		borderRadius: '24px',
		padding: '32px',
		textAlign: 'center',
		background:
			'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
		backdropFilter: 'blur(18px)',
		border: '1px solid rgba(59, 42, 130, 0.1)',
		boxShadow: '0 8px 32px rgba(59, 42, 130, 0.1)',
	},
});

export default function Dashboard() {
	const {
		heroCard,
		heroContent,
		heroOverlay,
		heroButton,
		statCard,
		donationCard,
		emptyState,
	} = useStyles();
	const { userId } = useAuth();
	const { data, isLoading, isError, error } = useDashboard(userId);

	useEffect(() => {
		if (data) {
			console.log('Dashboard data:', data);
		}
	}, [data]);

	if (isLoading) return <Typography p={2}>Loading dashboard...</Typography>;
	if (isError)
		return (
			<Typography p={2} color='error'>
				Error loading dashboard: {error?.message || 'Unknown error'}
			</Typography>
		);

	const stats = data?.stats ?? { total: 0, lastDonation: '-', eligibleIn: '-' };
	const donations = data?.donations ?? [];

	return (
		<Box p={2} display='flex' flexDirection='column' gap={3}>
			<motion.div
				initial={{ y: -30, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6 }}
			>
				<Card className={heroCard} sx={{ borderRadius: '24px' }}>
					<Box className={heroContent}>
						<Typography variant='h6' sx={{ color: 'white' }}>
							Welcome
						</Typography>
						<Typography variant='body2' sx={{ color: 'white' }}>
							Thanks you for being part of the warid community and helping
							saving live
						</Typography>
						<Button
							variant='contained'
							color='inherit'
							href='/events?page=1'
							className={heroButton}
						>
							Explore Events
						</Button>
					</Box>
					<Box className={heroOverlay} />
				</Card>
			</motion.div>

			<Box display='flex' gap={2} flexWrap='wrap'>
				<motion.div
					whileHover={{ y: -6 }}
					transition={{ type: 'spring', stiffness: 200 }}
					style={{ flex: '1 1 30%' }}
				>
					<Card className={statCard} sx={{ borderRadius: '24px' }}>
						<FavoriteIcon sx={{ color: colors.rose }} fontSize='large' />
						<Typography variant='subtitle2' color='text.secondary'>
							Total Donations
						</Typography>
						<Typography variant='h6'>{stats.total}</Typography>
					</Card>
				</motion.div>

				<motion.div
					whileHover={{ y: -6 }}
					transition={{ type: 'spring', stiffness: 200 }}
					style={{ flex: '1 1 30%' }}
				>
					<Card className={statCard} sx={{ borderRadius: '24px' }}>
						<AccessTimeIcon sx={{ color: colors.purple }} fontSize='large' />
						<Typography variant='subtitle2' color='text.secondary'>
							Next Donation
						</Typography>
						<Typography variant='h6'>{stats.eligibleIn}</Typography>
					</Card>
				</motion.div>

				<motion.div
					whileHover={{ y: -6 }}
					transition={{ type: 'spring', stiffness: 200 }}
					style={{ flex: '1 1 30%' }}
				>
					<Card className={statCard} sx={{ borderRadius: '24px' }}>
						<CalendarMonthIcon sx={{ color: colors.purple }} fontSize='large' />
						<Typography variant='subtitle2' color='text.secondary'>
							Last donation
						</Typography>
						<Typography variant='h6'>{stats.lastDonation}</Typography>
					</Card>
				</motion.div>
			</Box>

			<Box display='flex' flexDirection='column' gap={2}>
				<Typography variant='h5'>Your donations history</Typography>
				{donations.length > 0 ? (
					donations.map((d) => (
						<motion.div
							key={d.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
						>
							<Box className={donationCard} sx={{ borderRadius: '24px' }}>
								<CardContent>
									<Typography variant='h6'>{d.event}</Typography>

									<Box display='flex' alignItems='center' gap={1} mb={0.5}>
										<CalendarTodayIcon
											fontSize='small'
											sx={{ color: colors.purple }}
										/>
										<Typography variant='body2'>{d.date}</Typography>
									</Box>

									<Box display='flex' alignItems='center' gap={1}>
										<OpacityIcon fontSize='small' sx={{ color: colors.rose }} />
										<Typography variant='body2'>{d.type}</Typography>
									</Box>
								</CardContent>
							</Box>
						</motion.div>
					))
				) : (
					<Box className={emptyState} sx={{ borderRadius: '24px' }}>
						<FavoriteBorderIcon
							color='disabled'
							fontSize='large'
							sx={{ mb: 1 }}
						/>
						<Typography variant='h6' color='textSecondary' gutterBottom>
							You haven't made any donations yet!
						</Typography>
						<Typography variant='body2' color='textSecondary'>
							Join our community of heroes and start saving lives today. Explore
							upcoming events and make your first donation!
						</Typography>
						<Button
							variant='contained'
							color='error'
							href='/events?page=1'
							sx={{ mt: 2 }}
						>
							See Upcoming Events
						</Button>
					</Box>
				)}
			</Box>
		</Box>
	);
}
