import apiClient from './api';
import { 
  ApiResponse, 
  AuthData, 
  LoginRequestDto, 
  RefreshTokenRequestDto, 
  User,
  LoginCredentials,
  AuthResponse 
} from '../types';

interface TokenStorage {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  user: User;
}

export const authService = {
  // New API-compliant login method
  async loginAPI(credentials: LoginRequestDto): Promise<ApiResponse<AuthData>> {
    const response = await apiClient.post<ApiResponse<AuthData>>('/Auth/login', credentials);
    return response.data;
  },

  // Legacy login method for backward compatibility
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const apiCredentials: LoginRequestDto = {
      Username: credentials.username,
      Password: credentials.password
    };
    
    const response = await this.loginAPI(apiCredentials);
    
    if (response.Success && response.Data) {
      const { AccessToken, User: userData } = response.Data;
      this.storeTokenData(response.Data);
      
      // Return legacy format for backward compatibility
      return {
        token: AccessToken,
        user: userData
      };
    } else {
      throw new Error(response.Message || 'Login failed');
    }
  },

  async refreshToken(): Promise<ApiResponse<AuthData>> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequestDto = {
      RefreshToken: refreshToken
    };

    const response = await apiClient.post<ApiResponse<AuthData>>('/Auth/refresh', request);
    
    if (response.data.Success && response.data.Data) {
      this.storeTokenData(response.data.Data);
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/Auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearStorage();
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/Auth/me');
    return response.data;
  },

  // Token and storage management
  storeTokenData(authData: AuthData): void {
    const tokenStorage: TokenStorage = {
      accessToken: authData.AccessToken,
      refreshToken: authData.RefreshToken,
      accessTokenExpiry: authData.AccessTokenExpiry,
      refreshTokenExpiry: authData.RefreshTokenExpiry,
      user: authData.User
    };

    localStorage.setItem('tokenStorage', JSON.stringify(tokenStorage));
    
    // Legacy storage for backward compatibility
    localStorage.setItem('authToken', authData.AccessToken);
    localStorage.setItem('user', JSON.stringify(authData.User));
  },

  getTokenStorage(): TokenStorage | null {
    const stored = localStorage.getItem('tokenStorage');
    return stored ? JSON.parse(stored) : null;
  },

  getStoredUser(): User | null {
    const tokenStorage = this.getTokenStorage();
    if (tokenStorage) {
      return tokenStorage.user;
    }

    // Fallback to legacy storage
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getStoredToken(): string | null {
    const tokenStorage = this.getTokenStorage();
    if (tokenStorage) {
      return tokenStorage.accessToken;
    }

    // Fallback to legacy storage
    return localStorage.getItem('authToken');
  },

  getStoredRefreshToken(): string | null {
    const tokenStorage = this.getTokenStorage();
    return tokenStorage ? tokenStorage.refreshToken : null;
  },

  getAccessTokenExpiry(): Date | null {
    const tokenStorage = this.getTokenStorage();
    return tokenStorage ? new Date(tokenStorage.accessTokenExpiry) : null;
  },

  getRefreshTokenExpiry(): Date | null {
    const tokenStorage = this.getTokenStorage();
    return tokenStorage ? new Date(tokenStorage.refreshTokenExpiry) : null;
  },

  isTokenExpired(): boolean {
    const expiry = this.getAccessTokenExpiry();
    if (!expiry) return true;
    
    // Add 5 minute buffer before expiry
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return new Date().getTime() > (expiry.getTime() - bufferTime);
  },

  isRefreshTokenExpired(): boolean {
    const expiry = this.getRefreshTokenExpiry();
    if (!expiry) return true;
    
    return new Date().getTime() > expiry.getTime();
  },

  shouldRefreshToken(): boolean {
    return this.isTokenExpired() && !this.isRefreshTokenExpired();
  },

  clearStorage(): void {
    localStorage.removeItem('tokenStorage');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Legacy methods for backward compatibility
  storeAuth(token: string, user: any): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (!token || !user) {
      return false;
    }

    // Check if refresh token is expired
    if (this.isRefreshTokenExpired()) {
      this.clearStorage();
      return false;
    }

    return true;
  },

  // Automatic token refresh
  async ensureValidToken(): Promise<string | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    if (this.shouldRefreshToken()) {
      try {
        await this.refreshToken();
        return this.getStoredToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearStorage();
        return null;
      }
    }

    return this.getStoredToken();
  }
};
