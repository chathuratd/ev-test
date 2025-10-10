import apiClient from './api';
import { ApiResponse } from '../types';

export const seedService = {
  async createAdmin(): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/Seed/create-admin');
    return response.data;
  },

  // Legacy methods for backward compatibility
  async createAdminLegacy(): Promise<any> {
    const response = await this.createAdmin();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to create admin');
  }
};
