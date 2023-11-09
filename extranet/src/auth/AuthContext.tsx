import axios from 'axios';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { useAxiosInterceptor } from './useAxiosInterceptor';

interface AuthContextProps {
	token: string | null;
	userId: string | null;
	isAdmin: boolean;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
	setUserId: React.Dispatch<React.SetStateAction<string | null>>;
	setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
	refreshToken: () => Promise<void>;
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
		// Check if there is a current token and refreshToken available
		const currentToken = localStorage.getItem('token');
		const currentRefreshToken = localStorage.getItem('refreshToken');

		// Only proceed if both token and refreshToken are present
		if (currentToken && currentRefreshToken) {
			try {
				const response = await axios.post(
					'http://localhost:3000/api/auth/refresh-token',
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
			}
		}
	}, []);

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
