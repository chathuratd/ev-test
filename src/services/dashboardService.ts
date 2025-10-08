import { DashboardStats, RecentBooking, StationUtilization } from '../types';
import { MOCK_DASHBOARD_STATS, MOCK_RECENT_BOOKINGS, MOCK_STATION_UTILIZATION } from '../data/mockData';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DASHBOARD_STATS;
  },

  async getRecentBookings(): Promise<RecentBooking[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_RECENT_BOOKINGS;
  },

  async getStationUtilization(): Promise<StationUtilization[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_STATION_UTILIZATION;
  },
};
