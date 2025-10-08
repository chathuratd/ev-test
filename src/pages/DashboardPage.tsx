import React, { useEffect, useState } from 'react';
import { Calendar, Zap, Users, DollarSign } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats, RecentBooking, StationUtilization } from '../types';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [utilization, setUtilization] = useState<StationUtilization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, bookingsData, utilizationData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentBookings(),
        dashboardService.getStationUtilization(),
      ]);
      setStats(statsData);
      setRecentBookings(bookingsData);
      setUtilization(utilizationData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 248,
      change: stats?.bookingsChange || 12,
      icon: Calendar,
      description: 'from last month',
    },
    {
      title: 'Active Stations',
      value: stats?.activeStations || 12,
      change: 0,
      icon: Zap,
      description: `${stats?.stationsInMaintenance || 2} stations in maintenance`,
    },
    {
      title: 'EV Owners',
      value: stats?.evOwners || 1234,
      change: stats?.evOwnersChange || 18,
      icon: Users,
      description: 'from last month',
    },
    {
      title: 'Revenue',
      value: `LKR ${((stats?.revenue || 2400000) / 1000000).toFixed(1)}M`,
      change: stats?.revenueChange || -8,
      icon: DollarSign,
      description: 'from last month',
    },
  ];

  const mockRecentBookings = recentBookings.length > 0 ? recentBookings : [
    { customerName: 'Sarah Johnson', stationLocation: 'Downtown Hub', timeAgo: '2 hours ago' },
    { customerName: 'Michael Chen', stationLocation: 'Airport Express', timeAgo: '4 hours ago' },
    { customerName: 'Priya Patel', stationLocation: 'Mall Parking', timeAgo: '6 hours ago' },
  ];

  const mockUtilization = utilization.length > 0 ? utilization : [
    { stationName: 'Downtown Hub', utilizationPercentage: 85 },
    { stationName: 'Airport Express', utilizationPercentage: 72 },
    { stationName: 'Mall Parking', utilizationPercentage: 45 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to EV Station Booking Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">{card.title}</p>
              <div className="p-2 bg-zinc-800 rounded-lg">
                <card.icon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="mb-2">
              <h3 className="text-3xl font-bold text-white">{card.value}</h3>
            </div>
            <div className="flex items-center gap-2">
              {card.change !== 0 && (
                <span
                  className={`text-sm font-medium ${
                    card.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {card.change > 0 ? '+' : ''}
                  {card.change}%
                </span>
              )}
              <span className="text-gray-500 text-sm">{card.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Bookings</h2>
          <div className="space-y-4">
            {mockRecentBookings.map((booking, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
              >
                <div>
                  <p className="text-white font-medium">{booking.customerName}</p>
                  <p className="text-gray-400 text-sm">{booking.stationLocation}</p>
                </div>
                <span className="text-gray-500 text-sm">{booking.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Station Utilization</h2>
          <div className="space-y-6">
            {mockUtilization.map((station, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{station.stationName}</span>
                  <span className="text-white font-semibold">{station.utilizationPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${station.utilizationPercentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
