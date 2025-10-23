import React, { useEffect, useState } from 'react';
import { Calendar, Zap, Users, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { DashboardStats, RecentBooking, StationUtilization, Booking, BookingCounts } from '../types';
import SystemStatus from '../components/common/SystemStatus';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [utilization, setUtilization] = useState<StationUtilization[]>([]);
  const [bookingCounts, setBookingCounts] = useState<BookingCounts | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Use enhanced dashboard data method that includes all new endpoints
      const dashboardData = await dashboardService.getEnhancedDashboardData();
      
      setStats(dashboardData.stats);
      setRecentBookings(dashboardData.recentBookings);
      setUtilization(dashboardData.utilization);
      setBookingCounts(dashboardData.bookingCounts);
      setUpcomingBookings(dashboardData.upcomingBookings.slice(0, 5)); // Show first 5 upcoming
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please check if the backend is running.');
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
      value: stats?.totalBookings ?? 'Loading...',
      change: stats?.bookingsChange ?? 0,
      icon: Calendar,
      description: 'from last month',
    },
    {
      title: 'Active Stations',
      value: stats?.activeStations ?? 'Loading...',
      change: 0,
      icon: Zap,
      description: `${stats?.stationsInMaintenance ?? 'N/A'} stations in maintenance`,
    },
    {
      title: 'EV Owners',
      value: stats?.evOwners ?? 'Loading...',
      change: stats?.evOwnersChange ?? 0,
      icon: Users,
      description: 'from last month',
    },
    {
      title: 'Revenue',
      value: stats?.revenue ? `LKR ${(stats.revenue / 1000000).toFixed(1)}M` : 'Loading...',
      change: stats?.revenueChange ?? 0,
      icon: DollarSign,
      description: 'from last month',
    },
  ];

  // Additional booking status cards if booking counts are available
  const bookingStatusCards = bookingCounts ? [
    {
      title: 'Pending Bookings',
      value: bookingCounts.pending,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Confirmed Bookings',
      value: bookingCounts.confirmed,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Completed Today',
      value: bookingCounts.completed,
      icon: XCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Cancelled',
      value: bookingCounts.cancelled,
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ] : [];


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

      {/* Booking Status Cards */}
      {bookingStatusCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {bookingStatusCards.map((card, index) => (
            <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Recent Bookings</h2>
              <div className="space-y-4">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No recent bookings available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Station Utilization</h2>
              <div className="space-y-6">
                {utilization.length > 0 ? (
                  utilization.map((station, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No station utilization data available</p>
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
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{booking.EvOwnerName || booking.EvOwnerNic}</p>
                      <p className="text-gray-400 text-sm">{booking.StationLocation || booking.StationName}</p>
                      <p className="text-gray-500 text-xs">Slot {booking.SlotNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-sm font-medium">{booking.Status}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(booking.ReservationDateTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <SystemStatus showDetails={true} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
