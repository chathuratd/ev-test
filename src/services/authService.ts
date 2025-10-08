import { AuthResponse, LoginCredentials } from '../types';
import { DEMO_CREDENTIALS } from '../data/mockData';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const { username, password } = credentials;

    // Check against demo credentials
    const demoUser = Object.values(DEMO_CREDENTIALS).find(
      cred => cred.username === username && cred.password === password
    );

    if (!demoUser) {
      throw new Error('Invalid username or password');
    }

    // Generate a mock token
    const token = `demo-token-${demoUser.user.id}-${Date.now()}`;

    return {
      token,
      user: demoUser.user
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getStoredToken() {
    return localStorage.getItem('authToken');
  },

  storeAuth(token: string, user: any) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
