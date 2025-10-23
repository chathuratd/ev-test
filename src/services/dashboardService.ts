import apiClient from './api';
import { DashboardStats, RecentBooking, StationUtilization, ApiResponse, Booking } from '../types';

export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/Dashboard/stats');
    return response.data;
  },

  async getRecentBookings(count: number = 10): Promise<ApiResponse<RecentBooking[]>> {
    const response = await apiClient.get<ApiResponse<RecentBooking[]>>(`/Dashboard/recent-bookings?count=${count}`);
    return response.data;
  },

  async getStationUtilization(): Promise<ApiResponse<StationUtilization[]>> {
    const response = await apiClient.get<ApiResponse<StationUtilization[]>>('/Dashboard/station-utilization');
    return response.data;
  },

  // New test endpoints for development/debugging
  async getTestStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/Dashboard/test-stats');
    return response.data;
  },

  async getTestRecentBookings(count: number = 10): Promise<ApiResponse<RecentBooking[]>> {
    const response = await apiClient.get<ApiResponse<RecentBooking[]>>(`/Dashboard/test-recent-bookings?count=${count}`);
    return response.data;
  },

  async getTestStationUtilization(): Promise<ApiResponse<StationUtilization[]>> {
    const response = await apiClient.get<ApiResponse<StationUtilization[]>>('/Dashboard/test-station-utilization');
    return response.data;
  },

  // New booking endpoints for enhanced dashboard
  async getBookingCounts(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/Booking/counts');
    return response.data;
  },

  async getUpcomingBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/Booking/upcoming');
    return response.data;
  },

  async getCompletedBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/Booking/completed');
    return response.data;
  },

  async getCancelledBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/Booking/cancelled');
    return response.data;
  },

  // Legacy methods for backward compatibility
  async getStatsLegacy(): Promise<DashboardStats> {
    const response = await this.getStats();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch dashboard stats');
  },

  async getRecentBookingsLegacy(): Promise<RecentBooking[]> {
    const response = await this.getRecentBookings();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch recent bookings');
  },

  async getStationUtilizationLegacy(): Promise<StationUtilization[]> {
    const response = await this.getStationUtilization();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch station utilization');
  },

  // Test endpoint legacy methods (for development)
  async getTestStatsLegacy(): Promise<DashboardStats> {
    const response = await this.getTestStats();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch test dashboard stats');
  },

  async getTestRecentBookingsLegacy(): Promise<RecentBooking[]> {
    const response = await this.getTestRecentBookings();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch test recent bookings');
  },

  async getTestStationUtilizationLegacy(): Promise<StationUtilization[]> {
    const response = await this.getTestStationUtilization();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch test station utilization');
  },

  // New booking endpoint legacy methods
  async getBookingCountsLegacy(): Promise<any> {
    const response = await this.getBookingCounts();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch booking counts');
  },

  async getUpcomingBookingsLegacy(): Promise<Booking[]> {
    const response = await this.getUpcomingBookings();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch upcoming bookings');
  },

  async getCompletedBookingsLegacy(): Promise<Booking[]> {
    const response = await this.getCompletedBookings();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch completed bookings');
  },

  async getCancelledBookingsLegacy(): Promise<Booking[]> {
    const response = await this.getCancelledBookings();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch cancelled bookings');
  },

  // Development helper method to try test endpoints first, then fallback to production
  async getStatsWithFallback(): Promise<DashboardStats> {
    try {
      // Try test endpoint first (useful for development)
      return await this.getTestStatsLegacy();
    } catch (error) {
      console.warn('Test stats endpoint failed, trying production:', error);
      return await this.getStatsLegacy();
    }
  },

  async getRecentBookingsWithFallback(count: number = 10): Promise<RecentBooking[]> {
    try {
      // Try test endpoint first (useful for development)
      return await this.getTestRecentBookingsLegacy();
    } catch (error) {
      console.warn('Test recent bookings endpoint failed, trying production:', error);
      const response = await this.getRecentBookings(count);
      if (response.Success && response.Data) {
        return response.Data;
      }
      throw new Error(response.Message || 'Failed to fetch recent bookings');
    }
  },

  async getStationUtilizationWithFallback(): Promise<StationUtilization[]> {
    try {
      // Try test endpoint first (useful for development)
      return await this.getTestStationUtilizationLegacy();
    } catch (error) {
      console.warn('Test station utilization endpoint failed, trying production:', error);
      return await this.getStationUtilizationLegacy();
    }
  },

  // Enhanced dashboard data aggregation methods
  async getEnhancedDashboardData(): Promise<{
    stats: DashboardStats;
    recentBookings: RecentBooking[];
    utilization: StationUtilization[];
    bookingCounts: any;
    upcomingBookings: Booking[];
    completedBookings: Booking[];
    cancelledBookings: Booking[];
  }> {
    const isDevelopment = import.meta.env.DEV;
    
    const [
      stats,
      recentBookings,
      utilization,
      bookingCounts,
      upcomingBookings,
      completedBookings,
      cancelledBookings
    ] = await Promise.all([
      isDevelopment ? this.getStatsWithFallback() : this.getStatsLegacy(),
      isDevelopment ? this.getRecentBookingsWithFallback() : this.getRecentBookingsLegacy(),
      isDevelopment ? this.getStationUtilizationWithFallback() : this.getStationUtilizationLegacy(),
      this.getBookingCountsLegacy().catch(() => null),
      this.getUpcomingBookingsLegacy().catch(() => []),
      this.getCompletedBookingsLegacy().catch(() => []),
      this.getCancelledBookingsLegacy().catch(() => [])
    ]);

    return {
      stats,
      recentBookings,
      utilization,
      bookingCounts,
      upcomingBookings,
      completedBookings,
      cancelledBookings
    };
  }
};
