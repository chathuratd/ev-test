import React, { useEffect, useState } from 'react';
import { Calendar, Zap, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats, RecentBooking, StationUtilization, Booking } from '../types';
// import SystemStatus from '../components/common/SystemStatus';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [utilization, setUtilization] = useState<StationUtilization[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardData = await dashboardService.getEnhancedDashboardData();
      
      setStats(dashboardData.stats);
      setRecentBookings(dashboardData.recentBookings);
      setUtilization(dashboardData.utilization);
      setUpcomingBookings(dashboardData.upcomingBookings.slice(0, 5)); // Show first 5 upcoming
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(
        error?.response?.data?.Message || 
        error?.message || 
        'Failed to load dashboard data. Please check if the backend is running.'
      );
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      change: stats?.bookingsChange ?? 0,
      icon: Calendar,
      description: 'all time bookings',
    },
    {
      title: 'Active Stations',
      value: stats?.activeStations ?? 0,
      change: 0,
      icon: Zap,
      description: `${stats?.stationsInMaintenance ?? 0} in maintenance`,
    },
    {
      title: 'EV Owners',
      value: stats?.evOwners ?? 0,
      change: stats?.evOwnersChange ?? 0,
      icon: Users,
      description: 'registered users',
    },
    {
      title: 'Revenue',
      value: stats?.revenue ? `LKR ${stats.revenue.toFixed(2)}` : 'LKR 0.00',
      change: stats?.revenueChange ?? 0,
      icon: DollarSign,
      description: 'total revenue',
    },
  ];

  // Booking status cards from stats
  const bookingStatusCards = stats ? [
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings || 0,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Confirmed Bookings',
      value: stats.confirmedBookings || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Completed Bookings',
      value: stats.completedBookings || 0,
      icon: CheckCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
  ] : [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome to EV Station Booking Management System</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          title="Refresh dashboard data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">{card.title}</p>
              <div className="p-2 bg-zinc-800 rounded-lg">
                <card.icon className="w-5 h-5 text-green-400" />
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

      {/* Booking Status Cards */}
      {bookingStatusCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {bookingStatusCards.map((card, index) => (
            <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">{card.title}</p>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Recent Bookings</h2>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{booking.customerName}</p>
                        <p className="text-gray-400 text-sm truncate">{booking.stationLocation}</p>
                      </div>
                      <span className="text-gray-500 text-sm ml-2 whitespace-nowrap">{booking.timeAgo}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No recent bookings</p>
                  </div>
                )}
              </div>
            </div>

            {/* Station Utilization */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Top Station Utilization</h2>
              <div className="space-y-6">
                {utilization.length > 0 ? (
                  utilization.map((station, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm truncate pr-2">
                          {station.stationName}
                        </span>
                        <span className="text-white font-semibold text-sm whitespace-nowrap">
                          {station.utilizationPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            station.utilizationPercentage >= 80
                              ? 'bg-red-500'
                              : station.utilizationPercentage >= 50
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(station.utilizationPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No utilization data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Bookings Section */}
          {upcomingBookings.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-white mb-6">Upcoming Bookings</h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking, index) => (
                  <div
                    key={booking.Id || index}
                    className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {booking.EvOwnerName || booking.EvOwnerNic || 'Unknown'}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        {booking.ChargingStationName || 'Unknown Station'}
                      </p>
                      <p className="text-gray-500 text-xs">Slot {booking.SlotNumber}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-sm font-medium whitespace-nowrap ${
                        booking.Status === 'Pending' ? 'text-yellow-400' :
                        booking.Status === 'Confirmed' ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {booking.Status}
                      </p>
                      <p className="text-gray-500 text-xs whitespace-nowrap">
                        {new Date(booking.ReservationDateTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {/* <SystemStatus showDetails={true} /> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;