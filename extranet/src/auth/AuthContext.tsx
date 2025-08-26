import axios from 'axios';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import API_CONFIG, { buildApiUrl } from '../utils/apiConfig';
import { useAxiosInterceptor } from './useAxiosInterceptor';

interface AuthContextProps {
	token: string | null;
	userId: string | null;
	isAdmin: boolean;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
	setUserId: React.Dispatch<React.SetStateAction<string | null>>;
	setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
	refreshToken: () => Promise<void>;
	updateAuthState: (token: string, userId: string, isAdmin: boolean) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);

	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		const storedUserId = localStorage.getItem('userId');
		const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';

		if (storedToken) setToken(storedToken);
		if (storedUserId) setUserId(storedUserId);
		setIsAdmin(storedIsAdmin);
	}, []);

	const refreshToken = useCallback(async () => {
		const currentToken = localStorage.getItem('token');
		const currentRefreshToken = localStorage.getItem('refreshToken');

		if (currentToken && currentRefreshToken) {
			try {
				const response = await axios.post(
					buildApiUrl(API_CONFIG.endpoints.auth.refreshToken),
					{ refreshToken: currentRefreshToken }
				);

				const newToken = response.data.accessToken;
				const newRefreshToken = response.data.refreshToken;

				setToken(newToken);
				localStorage.setItem('token', newToken);
				localStorage.setItem('refreshToken', newRefreshToken);
				axios.defaults.headers['Authorization'] = `Bearer ${newToken}`;
			} catch (error) {
				console.error('Failed to refresh token:', error);
				// Handle token refresh failure
				// Optionally, redirect to login or logout the user
			}
		}
	}, []);

	const updateAuthState = useCallback(
		(newToken: string, newUserId: string, newIsAdmin: boolean) => {
			setToken(newToken);
			setUserId(newUserId);
			setIsAdmin(newIsAdmin);
		},
		[]
	);

	useAxiosInterceptor(refreshToken);

	return (
		<AuthContext.Provider
			value={{
				token,
				setToken,
				userId,
				setUserId,
				isAdmin,
				setIsAdmin,
				refreshToken,
				updateAuthState,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
