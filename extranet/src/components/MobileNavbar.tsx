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
			rgba(255, 255, 255, 0.10) 50%,
			rgba(255, 255, 255, 0.05) 75%,
			rgba(255, 255, 255, 0.02) 100%
		)`,
		backdropFilter: 'blur(20px) saturate(180%)',
		WebkitBackdropFilter: 'blur(20px) saturate(180%)',
		borderRadius: '24px 24px 0 0',
		border: `1px solid rgba(255, 255, 255, 0.2)`,
		boxShadow: `
			0 8px 32px rgba(0, 0, 0, 0.12),
			0 4px 16px rgba(0, 0, 0, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.35)
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
	overflow: 'hidden',

	'&::before': {
		content: '""',
		position: 'absolute',
		inset: 0,
		borderRadius: '16px',
		background:
			'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
		opacity: 0,
		transform: 'scale(0.8)',
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	},

	'&:hover::before': {
		opacity: 1,
		transform: 'scale(1)',
	},

	'&::after': {
		content: '""',
		position: 'absolute',
		inset: -2,
		borderRadius: '18px',
		background:
			'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
		opacity: 0,
		transform: 'scale(0.9)',
		transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
		pointerEvents: 'none',
	},

	'&:hover::after': {
		opacity: 0.6,
		transform: 'scale(1.1)',
	},
});

const NavIcon = styled(motion.div)<{ isActive: boolean }>(({ isActive }) => ({
	position: 'relative',
	zIndex: 2,
	color: isActive ? colors.rose : colors.purple,
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	fontSize: isActive ? '26px' : '24px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	filter: isActive ? `drop-shadow(0 2px 8px ${colors.rose}40)` : 'none',
}));

const NavLabel = styled(motion.div)<{ isActive: boolean }>(({ isActive }) => ({
	fontSize: '11px',
	fontWeight: isActive ? 600 : 500,
	color: isActive ? colors.rose : colors.purple,
	marginTop: '6px',
	textAlign: 'center',
	opacity: isActive ? 1 : 0.7,
	transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
	letterSpacing: '0.025em',
}));

const ActiveIndicator = styled(motion.div)({
	position: 'absolute',
	bottom: '6px',
	left: '50%',
	transform: 'translateX(-50%)',
	width: '32px',
	height: '3px',
	background: `linear-gradient(90deg, ${colors.rose}, #ff6b8a)`,
	borderRadius: '2px',
	boxShadow: `0 2px 8px ${colors.rose}40`,
});

const BackgroundHighlight = styled(motion.div)<{ isActive: boolean }>(
	({ isActive }) => ({
		position: 'absolute',
		inset: 0,
		borderRadius: '16px',
		background: isActive
			? 'linear-gradient(135deg, rgba(255, 48, 103, 0.15), rgba(255, 48, 103, 0.05))'
			: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
		opacity: isActive ? 1 : 0,
		transform: isActive ? 'scale(1)' : 'scale(0.9)',
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		pointerEvents: 'none',
	})
);

const RippleEffect = styled(motion.div)({
	position: 'absolute',
	inset: 0,
	borderRadius: '16px',
	background:
		'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
	pointerEvents: 'none',
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
	{ path: '/home', icon: HomeIcon, label: 'Home', exact: true },
	{ path: '/dashboard', icon: DashboardIcon, label: 'Dashboard', exact: true },
	{ path: '/events', icon: EventIcon, label: 'Events', exact: false },
	{ path: '/emergency', icon: EmergencyIcon, label: 'Emergency', exact: true },
	{ path: '/contact', icon: EmailIcon, label: 'Contact', exact: true },
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
	const [ripples, setRipples] = useState<
		Array<{ id: number; x: number; y: number }>
	>([]);

	const addRipple = (event: React.MouseEvent) => {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const newRipple = {
			id: Date.now(),
			x,
			y,
		};

		setRipples((prev) => [...prev, newRipple]);

		setTimeout(() => {
			setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
		}, 600);
	};

	const containerVariants = {
		hidden: { y: 100, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.5,
				staggerChildren: 0.08,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 30, opacity: 0, scale: 0.7 },
		visible: {
			y: 0,
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.4,
			},
		},
	};

	const iconVariants = {
		active: {
			scale: [1, 1.15, 1.1],
			rotate: [0, -3, 3, 0],
			transition: {
				duration: 0.6,
			},
		},
		inactive: {
			scale: 1,
			rotate: 0,
			transition: {
				duration: 0.4,
			},
		},
		hover: {
			scale: 1.2,
			rotate: [0, -2, 2, 0],
			transition: {
				duration: 0.3,
			},
		},
	};

	const rippleVariants = {
		initial: { scale: 0, opacity: 1 },
		animate: {
			scale: 4,
			opacity: 0,
			transition: {
				duration: 0.6,
			},
		},
	};

	const isActive = (item: (typeof navItems)[0]) => {
		if (item.exact) {
			return currentRoute === item.path;
		}
		return currentRoute.startsWith(item.path);
	};

	const filteredNavItems = navItems.filter((item) => {
		if (!token) {
			return item.path === '/emergency' || item.path === '/contact' || item.path === '/FAQ' || item.path === '/home';
		}
		if (item.path === '/home') {
			return false;
		}
		if (item.adminOnly && !(token && isAdmin)) {
			return false;
		}
		return true;
	});

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
								scale: 1.02,
								transition: { duration: 0.2 },
							}}
							whileTap={{
								scale: 0.98,
								transition: { duration: 0.1 },
							}}
							onHoverStart={() => setHoveredItem(item.path)}
							onHoverEnd={() => setHoveredItem(null)}
							onClick={(e) => {
								addRipple(e);
								setHoveredItem(null);
							}}
						>
							<BackgroundHighlight isActive={active} />

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
									position: 'relative',
									zIndex: 3,
								}}
							>
								<NavIcon
									isActive={active}
									variants={iconVariants}
									animate={active ? 'active' : isHovered ? 'hover' : 'inactive'}
									whileHover={{ scale: 1.15 }}
									whileTap={{ scale: 0.9 }}
								>
									<IconComponent
										sx={{
											fontSize: active ? '26px' : '24px',
											filter: active
												? 'drop-shadow(0 0 8px rgba(29, 185, 84, 0.4))'
												: 'none',
											transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
												duration: 0.4,
											}}
										/>
									)}
								</AnimatePresence>
							</Link>

							<AnimatePresence>
								{ripples.map((ripple) => (
									<RippleEffect
										key={ripple.id}
										variants={rippleVariants}
										initial='initial'
										animate='animate'
										style={{
											left: ripple.x - 20,
											top: ripple.y - 20,
											width: 40,
											height: 40,
										}}
									/>
								))}
							</AnimatePresence>

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
