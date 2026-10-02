import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check persistent session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const { user } = await authApi.getMe();
        setUser(user);
      } catch {
        // Unauthenticated or expired token
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    const data = await authApi.login(credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(data.user);
  };

  const register = async (userData: any) => {
    const data = await authApi.register(userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
