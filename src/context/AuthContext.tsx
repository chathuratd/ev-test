import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequestDto } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  // Legacy methods for backward compatibility
  loginLegacy: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          
          // Check if token needs refresh
          if (authService.shouldRefreshToken()) {
            try {
              await authService.refreshToken();
              // Get updated user data after refresh
              const updatedUser = authService.getStoredUser();
              if (updatedUser) {
                setUser(updatedUser);
              }
            } catch (error) {
              console.error('Token refresh failed during initialization:', error);
              await handleLogout();
            }
          }
        } else {
          // Clear invalid auth state
          authService.clearStorage();
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      authService.clearStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequestDto): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.loginAPI(credentials);
      
      if (response.Success && response.Data) {
        authService.storeTokenData(response.Data);
        setUser(response.Data.User);
      } else {
        throw new Error(response.Message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();
      if (response.Success && response.Data) {
        setUser(response.Data.User);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await handleLogout();
      throw error;
    }
  };

  const getCurrentUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      if (response.Success && response.Data) {
        setUser(response.Data);
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  };

  const handleLogout = async (): Promise<void> => {
    authService.clearStorage();
    setUser(null);
  };

  // Legacy method for backward compatibility
  const loginLegacy = (token: string, userData: User) => {
    authService.storeAuth(token, userData);
    setUser(userData);
  };

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = () => {
      if (authService.shouldRefreshToken()) {
        refreshToken().catch((error) => {
          console.error('Automatic token refresh failed:', error);
        });
      }
    };

    // Check token expiry every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    // Also check on focus (when user returns to tab)
    const handleFocus = () => {
      if (authService.shouldRefreshToken()) {
        refreshToken().catch((error) => {
          console.error('Token refresh on focus failed:', error);
        });
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    loginLegacy, // For backward compatibility
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
