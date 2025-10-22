import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Battery, ChevronRight, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { stationService } from '../services/stationService';
import { Booking, ChargingStation, BookingStatus } from '../types';
import apiClient from '../services/api';

interface DashboardStats {
  pendingReservations: number;
  approvedReservations: number;
  totalBookings: number;
  nearbyStations: number;
}

const EVOwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    pendingReservations: 0,
    approvedReservations: 0,
    totalBookings: 0,
    nearbyStations: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [nearbyStations, setNearbyStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current user NIC from localStorage (set during login)
      const currentUserNIC = localStorage.getItem('userNic') || localStorage.getItem('evOwnerNic');
      
      if (!currentUserNIC) {
        console.error('No user NIC found in localStorage');
        navigate('/ev-owner-login');
        return;
      }
      
      // THIN CLIENT: Use backend endpoint for dashboard stats
      // Backend calculates: pending, approved, completed counts, recent bookings, etc.
      const statsResponse = await apiClient.get(`/api/v1/EVOwners/${currentUserNIC}/dashboard-stats`);
      
      if (statsResponse.data.Success && statsResponse.data.Data) {
        const dashboardData = statsResponse.data.Data;
        
        // Use backend-calculated statistics directly
        setStats({
          pendingReservations: dashboardData.PendingReservations || 0,
          approvedReservations: dashboardData.ApprovedReservations || 0,
          totalBookings: dashboardData.TotalBookings || 0,
          nearbyStations: 0 // Will be updated from stations API
        });
        
        // Use backend-provided recent bookings (already sorted and limited)
        setRecentBookings(dashboardData.RecentBookings || []);
      }
      
      // Fetch all stations from API
      const stationsResponse = await stationService.getAllStations();
      if (stationsResponse.Success && stationsResponse.Data) {
        const stations = stationsResponse.Data;
        // Take first 4 stations as "nearby" - in real app, would use location-based filtering
        setNearbyStations(stations.slice(0, 4));
        
        // Update nearby stations count
        setStats(prev => ({
          ...prev,
          nearbyStations: stations.length
        }));
      }
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      
      if (error.response?.status === 401) {
        navigate('/ev-owner-login');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case BookingStatus.Confirmed:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case BookingStatus.Completed:
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case BookingStatus.Cancelled:
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case BookingStatus.Confirmed:
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case BookingStatus.Completed:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case BookingStatus.Cancelled:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateBooking = () => {
    navigate('/ev-owner/book-station');
  };

  const handleViewAllBookings = () => {
    navigate('/ev-owner/bookings');
  };

  const handleViewStations = () => {
    navigate('/ev-owner/stations');
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
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="text-red-300 text-sm underline hover:text-red-200 mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">EV Owner Dashboard</h1>
          <p className="text-gray-400">Welcome back! Manage your charging sessions and reservations.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.pendingReservations}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Pending Reservations</h3>
            <p className="text-gray-400 text-sm">Awaiting confirmation</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.approvedReservations}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Approved Reservations</h3>
            <p className="text-gray-400 text-sm">Confirmed future bookings</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.totalBookings}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Total Bookings</h3>
            <p className="text-gray-400 text-sm">All time sessions</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.nearbyStations}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Nearby Stations</h3>
            <p className="text-gray-400 text-sm">Within 10km radius</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
                <button
                  onClick={handleViewAllBookings}
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 font-medium text-sm transition-colors"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.Id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                          <Battery className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Station {booking.ChargingStationId} - Slot {booking.SlotNumber}</h3>
                          <p className="text-gray-400 text-sm">{formatDateTime(booking.ReservationDateTime)}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(booking.Status)}`}>
                        {getStatusIcon(booking.Status)}
                        {booking.Status}
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentBookings.length === 0 && (
                  <div className="text-center py-8">
                    <Battery className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No bookings yet</p>
                    <p className="text-gray-500 text-sm mb-4">Start by booking your first charging session</p>
                    <button
                      onClick={handleCreateBooking}
                      className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Station Map & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleCreateBooking}
                  className="w-full flex items-center gap-3 bg-green-500 hover:bg-green-600 text-black font-semibold p-4 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Book Charging Station
                </button>
                <button
                  onClick={handleViewStations}
                  className="w-full flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium p-4 rounded-lg border border-zinc-700 transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  Find Stations
                </button>
                <button
                  onClick={handleViewAllBookings}
                  className="w-full flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium p-4 rounded-lg border border-zinc-700 transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  My Bookings
                </button>
              </div>
            </div>

            {/* Nearby Stations */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Nearby Stations</h2>
                <button
                  onClick={handleViewStations}
                  className="text-green-400 hover:text-green-300 font-medium text-sm transition-colors"
                >
                  View Map
                </button>
              </div>

              <div className="space-y-3">
                {nearbyStations.map((station) => (
                  <div key={station.Id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 hover:border-zinc-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium text-sm">{station.Name}</h3>
                        <p className="text-gray-400 text-xs">{station.Location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm font-medium">{station.TotalSlots - (station.AvailableSlots || 0)}/{station.TotalSlots}</p>
                        <p className="text-gray-400 text-xs">Available</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="mt-4 bg-zinc-800 border border-zinc-700 rounded-lg p-8 text-center">
                <MapPin className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-400 text-sm">Station Map</p>
                <p className="text-gray-500 text-xs">Interactive map coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVOwnerDashboardPage;