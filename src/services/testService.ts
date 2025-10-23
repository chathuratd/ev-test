import apiClient from './api';
import { ApiResponse } from '../types';

export const testService = {
  async healthCheck(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/Test/health');
    return response.data;
  },

  async getCollections(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/Test/collections');
    return response.data;
  },

  // Legacy methods for backward compatibility
  async healthCheckLegacy(): Promise<any> {
    const response = await this.healthCheck();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Health check failed');
  },

  async getCollectionsLegacy(): Promise<any> {
    const response = await this.getCollections();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to get collections');
  }
};
