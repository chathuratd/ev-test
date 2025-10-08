import apiClient from './api';
import { DashboardStats, RecentBooking, StationUtilization } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getRecentBookings(): Promise<RecentBooking[]> {
    const response = await apiClient.get<RecentBooking[]>('/dashboard/recent-bookings');
    return response.data;
  },

  async getStationUtilization(): Promise<StationUtilization[]> {
    const response = await apiClient.get<StationUtilization[]>('/dashboard/station-utilization');
    return response.data;
  },
};
