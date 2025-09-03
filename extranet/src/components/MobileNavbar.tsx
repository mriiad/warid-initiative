import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import EmergencyIcon from '@mui/icons-material/HealthAndSafety';
import FAQIcon from '@mui/icons-material/Help';
import HomeIcon from '@mui/icons-material/Home';
import { styled } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import colors from '../styles/colors';

const NavbarContainer = styled(motion.div)(({ theme }) => ({
	position: 'fixed',
	bottom: 0,
	left: 0,
	right: 0,
	zIndex: 1000,
	padding: '0 16px 8px 16px',
	pointerEvents: 'none',

	'&::before': {
		content: '""',
		position: 'absolute',
		bottom: 0,
		left: '50%',
		transform: 'translateX(-50%)',
		width: 'calc(100% - 32px)',
		height: '80px',
		background: `linear-gradient(135deg,
			rgba(255, 255, 255, 0.25) 0%,
			rgba(255, 255, 255, 0.15) 25%,
			rgba(255, 255, 255, 0.1) 50%,
			rgba(255, 255, 255, 0.05) 75%,
			rgba(255, 255, 255, 0.02) 100%
		)`,
		backdropFilter: 'blur(20px) saturate(180%)',
		WebkitBackdropFilter: 'blur(20px) saturate(180%)',
		borderRadius: '24px 24px 0 0',
		border: `1px solid rgba(255, 255, 255, 0.2)`,
		boxShadow: `
			0 8px 32px rgba(0, 0, 0, 0.1),
			0 4px 16px rgba(0, 0, 0, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.3)
		`,
	},
}));

const NavbarContent = styled(motion.div)({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-around',
	height: '72px',
	position: 'relative',
	pointerEvents: 'auto',
	padding: '0 8px',
});

const NavItem = styled(motion.div)({
	position: 'relative',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: '56px',
	minHeight: '56px',
	borderRadius: '16px',
	cursor: 'pointer',
	transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
	'&::before': {
		content: '""',
		position: 'absolute',
		inset: 0,
		borderRadius: '16px',
		background: 'rgba(255, 255, 255, 0.1)',
		opacity: 0,
		transition: 'opacity 0.2s ease',
	},
	'&:hover::before': {
		opacity: 1,
	},
	'&:active': {
		transform: 'scale(0.95)',
	},
});

const NavIcon = styled(motion.div)<{ isActive: boolean }>(({ isActive }) => ({
	position: 'relative',
	zIndex: 1,
	color: isActive ? colors.rose : colors.purple,
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	fontSize: '24px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}));

const NavLabel = styled(motion.div)<{ isActive: boolean }>(({ isActive }) => ({
	fontSize: '11px',
	fontWeight: isActive ? 600 : 500,
	color: isActive ? colors.rose : colors.purple,
	marginTop: '4px',
	textAlign: 'center',
	opacity: isActive ? 1 : 0.7,
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	letterSpacing: '0.025em',
}));

const ActiveIndicator = styled(motion.div)({
	position: 'absolute',
	bottom: '8px',
	left: '50%',
	transform: 'translateX(-50%)',
	width: '32px',
	height: '3px',
	background: `linear-gradient(90deg, ${colors.rose}, #ff6b8a)`,
	borderRadius: '2px',
	boxShadow: `0 2px 8px ${colors.rose}40`,
});

const Tooltip = styled(motion.div)({
	position: 'absolute',
	bottom: '100%',
	left: '50%',
	transform: 'translateX(-50%)',
	background: 'rgba(0, 0, 0, 0.8)',
	color: 'white',
	padding: '8px 12px',
	borderRadius: '8px',
	fontSize: '12px',
	fontWeight: 500,
	whiteSpace: 'nowrap',
	marginBottom: '12px',
	pointerEvents: 'none',
	zIndex: 1001,
	'&::after': {
		content: '""',
		position: 'absolute',
		top: '100%',
		left: '50%',
		transform: 'translateX(-50%)',
		border: '6px solid transparent',
		borderTopColor: 'rgba(0, 0, 0, 0.8)',
	},
});

const navItems = [
	{ path: '/', icon: HomeIcon, label: 'Home', exact: true },
	{ path: '/dashboard', icon: DashboardIcon, label: 'Dashboard', exact: true },
	{ path: '/events', icon: EventIcon, label: 'Events', exact: false },
	{ path: '/contact', icon: EmailIcon, label: 'Contact', exact: true },
	{ path: '/emergency', icon: EmergencyIcon, label: 'Emergency', exact: true },
	{
		path: '/admin',
		icon: AdminPanelSettingsIcon,
		label: 'Admin',
		exact: true,
		adminOnly: true,
	},
	{ path: '/FAQ', icon: FAQIcon, label: 'Help', exact: true },
];

const MobileNavbar = () => {
	const { token, isAdmin } = useAuth();
	const location = useLocation();
	const currentRoute = location.pathname;
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);

	const containerVariants = {
		hidden: { y: 100, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.4,
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0, scale: 0.8 },
		visible: {
			y: 0,
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.3,
			},
		},
	};

	const iconVariants = {
		active: {
			scale: 1.1,
			rotate: [0, -5, 5, 0],
			transition: {
				duration: 0.4,
			},
		},
		inactive: {
			scale: 1,
			rotate: 0,
			transition: {
				duration: 0.3,
			},
		},
	};

	const isActive = (item: (typeof navItems)[0]) => {
		if (item.exact) {
			return currentRoute === item.path;
		}
		return currentRoute.startsWith(item.path);
	};

	const filteredNavItems = navItems.filter(
		(item) => !item.adminOnly || (token && isAdmin)
	);

	return (
		<NavbarContainer
			variants={containerVariants}
			initial='hidden'
			animate='visible'
		>
			<NavbarContent>
				{filteredNavItems.map((item, index) => {
					const IconComponent = item.icon;
					const active = isActive(item);
					const isHovered = hoveredItem === item.path;

					return (
						<NavItem
							key={item.path}
							variants={itemVariants}
							whileHover={{
								scale: 1.05,
								transition: { duration: 0.2 },
							}}
							whileTap={{
								scale: 0.95,
								transition: { duration: 0.1 },
							}}
							onHoverStart={() => setHoveredItem(item.path)}
							onHoverEnd={() => setHoveredItem(null)}
							onClick={() => setHoveredItem(null)}
						>
							<Link
								to={item.path === '/events' ? '/events?page=1' : item.path}
								style={{
									textDecoration: 'none',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									width: '100%',
									height: '100%',
									padding: '8px 4px',
									borderRadius: '16px',
								}}
							>
								<NavIcon
									isActive={active}
									variants={iconVariants}
									animate={active ? 'active' : 'inactive'}
									whileHover={{ scale: 1.15 }}
									whileTap={{ scale: 0.9 }}
								>
									<IconComponent
										sx={{
											fontSize: active ? '26px' : '24px',
											filter: active
												? `drop-shadow(0 2px 8px ${colors.rose}40)`
												: 'none',
										}}
									/>
								</NavIcon>

								<NavLabel
									isActive={active}
									animate={{
										y: active ? -2 : 0,
										fontWeight: active ? 600 : 500,
									}}
								>
									{item.label}
								</NavLabel>

								<AnimatePresence>
									{active && (
										<ActiveIndicator
											initial={{ scale: 0, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											exit={{ scale: 0, opacity: 0 }}
											transition={{
												duration: 0.3,
												ease: [0.25, 0.46, 0.45, 0.94],
											}}
										/>
									)}
								</AnimatePresence>
							</Link>

							<AnimatePresence>
								{isHovered && !active && (
									<Tooltip
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										transition={{ duration: 0.2 }}
									>
										{item.label}
									</Tooltip>
								)}
							</AnimatePresence>
						</NavItem>
					);
				})}
			</NavbarContent>
		</NavbarContainer>
	);
};

export default MobileNavbar;
