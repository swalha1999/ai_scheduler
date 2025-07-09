'use client';

import { getSession, logout } from '@/app/_auth_actions/auth';
import type { SafeUser } from '@/data/access-layer-v2/schemas/auth.schema';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react';

interface AuthContextType {
	user: SafeUser | null;
	loading: boolean;
	refreshUser: () => Promise<void>;
	logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<SafeUser | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchUser = useCallback(async () => {
		try {
			const sessionUser = await getSession();
			setUser(sessionUser);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setUser(null);
			setLoading(false);
		}
	}, []);

	const handleLogout = useCallback(async () => {
		await logout();
		setUser(null);
	}, []);

	// Initial fetch only
	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	return (
		<AuthContext.Provider
			value={{ loading, user, refreshUser: fetchUser, logoutUser: handleLogout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
