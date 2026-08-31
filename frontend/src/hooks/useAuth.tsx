import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { authApi } from '../api/auth';
import { UserProfile } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access');
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const profile = await authApi.getProfile();
        setState({
          isAuthenticated: true,
          user: profile,
          isLoading: false,
          error: null,
        });
      } catch {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('avatar');
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState(prev => ({ ...prev, error: null }));
    try {
      const response = await authApi.login({ username, password });
      localStorage.setItem('access', response.access);
      localStorage.setItem('refresh', response.refresh);
      localStorage.setItem('userId', String(response.user.user));
      localStorage.setItem('username', response.user.username);

      const profile = await authApi.getProfile();
      if (profile.avatar) {
        localStorage.setItem('avatar', profile.avatar);
      }

      setState({
        isAuthenticated: true,
        user: profile,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || error.response?.data?.error || 'Login failed';
      setState(prev => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setState(prev => ({ ...prev, error: null }));
    try {
      await authApi.signup({ username, email, password });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.response?.data?.error || 'Signup failed';
      setState(prev => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
    navigate('/login');
  }, [navigate]);

  const updateUser = useCallback((user: UserProfile) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
