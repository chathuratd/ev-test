import apiClient from './api';
import { ApiResponse } from '../types';

export interface TokenInfo {
  isValid: boolean;
  userId?: string;
  userRole?: string;
  expiresAt?: string;
  issuer?: string;
  subject?: string;
  claims?: Record<string, any>;
}

export interface PingResponse {
  success: boolean;
  message: string;
  timestamp: string;
  version?: string;
}

export const debugService = {
  async getTokenInfo(): Promise<ApiResponse<TokenInfo>> {
    const response = await apiClient.get<ApiResponse<TokenInfo>>('/Debug/token-info');
    return response.data;
  },

  async ping(): Promise<ApiResponse<PingResponse>> {
    const response = await apiClient.get<ApiResponse<PingResponse>>('/Debug/ping');
    return response.data;
  },

  // Convenience methods that return data directly
  async getTokenInfoDirect(): Promise<TokenInfo> {
    const response = await this.getTokenInfo();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to get token info');
  },

  async pingDirect(): Promise<PingResponse> {
    const response = await this.ping();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to ping server');
  },

  // Utility method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokenInfo = await this.getTokenInfoDirect();
      return tokenInfo.isValid;
    } catch (error) {
      console.warn('Authentication check failed:', error);
      return false;
    }
  },

  // Utility method to test API connectivity
  async testConnectivity(): Promise<boolean> {
    try {
      const pingResponse = await this.pingDirect();
      return pingResponse.success;
    } catch (error) {
      console.warn('Connectivity test failed:', error);
      return false;
    }
  },

  // Combined health check method
  async healthCheck(): Promise<{ connectivity: boolean; authentication: boolean; details: Record<string, any> }> {
    const results = {
      connectivity: false,
      authentication: false,
      details: {} as Record<string, any>
    };

    try {
      // Test connectivity first
      const pingResponse = await this.pingDirect();
      results.connectivity = pingResponse.success;
      results.details.ping = pingResponse;

      if (results.connectivity) {
        // If connected, test authentication
        try {
          const tokenInfo = await this.getTokenInfoDirect();
          results.authentication = tokenInfo.isValid;
          results.details.tokenInfo = tokenInfo;
        } catch (authError) {
          results.authentication = false;
          results.details.authError = authError;
        }
      }
    } catch (connectError) {
      results.connectivity = false;
      results.details.connectError = connectError;
    }

    return results;
  }
};