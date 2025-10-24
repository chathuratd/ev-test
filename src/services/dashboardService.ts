import apiClient from './api';
import { DashboardStats, RecentBooking, StationUtilization, ApiResponse, Booking, BackendDashboardStats, BackendStationUtilization } from '../types';

export const dashboardService = {
  // Core API methods
  async getStats(): Promise<ApiResponse<BackendDashboardStats>> {
    const response = await apiClient.get<ApiResponse<BackendDashboardStats>>('/Dashboard/stats');
    return response.data;
  },

  async getStationUtilization(): Promise<ApiResponse<BackendStationUtilization[]>> {
    const response = await apiClient.get<ApiResponse<BackendStationUtilization[]>>('/Dashboard/station-utilization');
    return response.data;
  },

  async getRecentBookings(count: number = 10): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/Dashboard/recent-bookings?count=${count}`);
    return response.data;
  },

  async getUpcomingBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/Booking/upcoming');
    return response.data;
  },

  // Transformation methods that convert backend responses to frontend format
  async getStatsTransformed(): Promise<DashboardStats> {
    const response = await this.getStats();
    if (response.Success && response.Data) {
      const data = response.Data;
      return {
        totalBookings: data.TotalBookings || 0,
        activeStations: data.ActiveStations || 0,
        evOwners: data.TotalEVOwners || 0,
        revenue: data.TotalRevenue || 0,
        bookingsChange: 0, // Backend doesn't provide this
        evOwnersChange: 0, // Backend doesn't provide this
        revenueChange: 0, // Backend doesn't provide this
        stationsInMaintenance: data.InactiveStations || 0,
        pendingBookings: data.PendingBookings || 0,
        confirmedBookings: data.ConfirmedBookings || 0,
        completedBookings: data.CompletedBookings || 0,
      };
    }
    throw new Error(response.Message || 'Failed to fetch dashboard stats');
  },

  async getStationUtilizationTransformed(): Promise<StationUtilization[]> {
    const response = await this.getStationUtilization();
    if (response.Success && response.Data) {
      // Transform, sort by utilization (highest first), and take top 5
      return response.Data
        .map((station: BackendStationUtilization) => ({
          stationName: station.StationName || 'Unknown Station',
          utilizationPercentage: Math.round(station.UtilizationPercentage || 0),
        }))
        .sort((a, b) => b.utilizationPercentage - a.utilizationPercentage)
        .slice(0, 5);
    }
    throw new Error(response.Message || 'Failed to fetch station utilization');
  },

  async getRecentBookingsTransformed(): Promise<RecentBooking[]> {
    try {
      // Use the actual recent-bookings endpoint
      const recentResponse = await this.getRecentBookings(10);
      if (recentResponse.Success && recentResponse.Data) {
        // Transform the bookings
        return recentResponse.Data.map((booking: Booking) => ({
          customerName: booking.EvOwnerName || booking.EvOwnerNic || 'Unknown',
          stationLocation: booking.ChargingStationName || booking.StationLocation || 'Unknown Location',
          timeAgo: this.getTimeAgo(booking.CreatedAt || booking.ReservationDateTime),
        }));
      }
    } catch (error) {
      console.warn('Failed to fetch recent bookings from /Dashboard/recent-bookings:', error);
      
      // Fallback: try using upcoming bookings
      try {
        const upcomingResponse = await this.getUpcomingBookings();
        if (upcomingResponse.Success && upcomingResponse.Data) {
          return upcomingResponse.Data.slice(0, 10).map((booking: Booking) => ({
            customerName: booking.EvOwnerName || booking.EvOwnerNic || 'Unknown',
            stationLocation: booking.ChargingStationName || booking.StationLocation || 'Unknown Location',
            timeAgo: this.getTimeAgo(booking.CreatedAt || booking.ReservationDateTime),
          }));
        }
      } catch (fallbackError) {
        console.warn('Fallback to upcoming bookings also failed:', fallbackError);
      }
    }
    
    // Always return empty array if everything fails
    return [];
  },

  async getUpcomingBookingsTransformed(): Promise<Booking[]> {
    try {
      const response = await this.getUpcomingBookings();
      if (response.Success && response.Data) {
        return response.Data;
      }
    } catch (error) {
      console.warn('Upcoming bookings not available:', error);
    }
    
    // Always return empty array if request fails
    return [];
  },

  // Utility method to calculate time ago
  getTimeAgo(dateString: string): string {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  },

  // Main method to fetch all dashboard data
  async getEnhancedDashboardData(): Promise<{
    stats: DashboardStats;
    recentBookings: RecentBooking[];
    utilization: StationUtilization[];
    upcomingBookings: Booking[];
  }> {
    try {
      // Fetch all data in parallel
      const [stats, utilization, recentBookings, upcomingBookings] = await Promise.allSettled([
        this.getStatsTransformed(),
        this.getStationUtilizationTransformed(),
        this.getRecentBookingsTransformed(),
        this.getUpcomingBookingsTransformed(),
      ]);

      return {
        stats: stats.status === 'fulfilled' ? stats.value : {
          totalBookings: 0,
          activeStations: 0,
          evOwners: 0,
          revenue: 0,
          bookingsChange: 0,
          evOwnersChange: 0,
          revenueChange: 0,
          stationsInMaintenance: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          completedBookings: 0,
        },
        utilization: utilization.status === 'fulfilled' ? utilization.value : [],
        recentBookings: recentBookings.status === 'fulfilled' ? recentBookings.value : [],
        upcomingBookings: upcomingBookings.status === 'fulfilled' ? upcomingBookings.value : [],
      };
    } catch (error) {
      console.error('Error fetching enhanced dashboard data:', error);
      throw error;
    }
  },
};