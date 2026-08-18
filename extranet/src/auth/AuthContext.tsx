import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';

interface AuthContextProps {
	token: string | null;
	userId: string | null;
	isAdmin: boolean;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
	setUserId: React.Dispatch<React.SetStateAction<string | null>>;
	setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
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

	const updateAuthState = useCallback(
		(newToken: string, newUserId: string, newIsAdmin: boolean) => {
			setToken(newToken);
			setUserId(newUserId);
			setIsAdmin(newIsAdmin);
		},
		[]
	);

	return (
		<AuthContext.Provider
			value={{
				token,
				setToken,
				userId,
				setUserId,
				isAdmin,
				setIsAdmin,
				updateAuthState,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// The Provider-plus-hook pattern this file follows (standard for a React
// context) is exactly what react-refresh/only-export-components flags: Fast
// Refresh can only hot-reload a module whose exports are all components, so
// mixing AuthProvider with this hook means an edit here triggers a full page
// reload instead. That's a real but minor dev-time cost, not a bug -- fixing
// it would mean splitting the hook into its own file and updating the ~17
// call sites that import useAuth from here, which is more churn than the
// warning is worth (see eslint.config.js's own note against unrelated
// refactors for cosmetic lint rules).
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
