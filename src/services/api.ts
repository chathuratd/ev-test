import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5058/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('Authentication failed, attempting to diagnose...', {
        url: originalRequest.url,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      // Try to get debug info if available
      try {
        const { debugService } = await import('./debugService');
        const tokenInfo = await debugService.getTokenInfoDirect();
        console.warn('Token debug info:', tokenInfo);
      } catch (debugError) {
        console.warn('Could not get token debug info:', debugError);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dynamic import to avoid circular dependency
        const { authService } = await import('./authService');
        
        if (authService.shouldRefreshToken()) {
          console.log('Attempting token refresh...');
          const response = await authService.refreshToken();
          if (response.Success && response.Data) {
            const newToken = response.Data.AccessToken;
            console.log('Token refresh successful');
            onTokenRefreshed(newToken);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            return apiClient(originalRequest);
          }
        }
        
        // If we can't refresh, clear auth and redirect
        console.warn('Token refresh failed or not available, clearing auth');
        authService.clearStorage();
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect
        console.error('Token refresh error:', refreshError);
        const { authService } = await import('./authService');
        authService.clearStorage();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Enhanced error logging for other status codes
    if (error.response) {
      console.warn('API Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('Network Error:', {
        url: originalRequest.url,
        message: 'No response received from server'
      });
      
      // Try to ping the server to check connectivity
      try {
        const { debugService } = await import('./debugService');
        const canPing = await debugService.testConnectivity();
        if (!canPing) {
          console.error('Server connectivity test failed');
        }
      } catch (pingError) {
        console.error('Could not test server connectivity:', pingError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
