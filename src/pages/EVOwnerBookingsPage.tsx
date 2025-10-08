import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Battery, AlertCircle, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import apiClient from '../services/api';

const EVOwnerBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.Id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.ChargingStationId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.Status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, bookings]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      
      // Get current user NIC from localStorage (set during login)
      const currentUserNIC = localStorage.getItem('userNic') || localStorage.getItem('evOwnerNic');
      
      if (!currentUserNIC) {
        console.error('No user NIC found in localStorage');
        window.location.href = '/ev-owner-login';
        return;
      }
      
      // Fetch user bookings from API
      const response = await apiClient.get(`/api/v1/Booking/evowner/${currentUserNIC}`);
      if (response.data.Success && response.data.Data) {
        const userBookings: Booking[] = response.data.Data;
        setBookings(userBookings);
        setFilteredBookings(userBookings);
      } else {
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        window.location.href = '/ev-owner-login';
      }
      setBookings([]);
      setFilteredBookings([]);
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
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelBooking = (booking: Booking) => {
    return booking.Status === BookingStatus.Pending || booking.Status === BookingStatus.Confirmed;
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        // Call API to cancel booking
        await apiClient.put('/api/v1/Booking/cancel', {
          BookingId: bookingId,
          CancellationReason: 'Cancelled by user'
        });
        
        // Update local state
        setBookings(prev => 
          prev.map(booking => 
            booking.Id === bookingId 
              ? { ...booking, Status: BookingStatus.Cancelled }
              : booking
          )
        );
        alert('Booking cancelled successfully');
      } catch (error: any) {
        console.error('Failed to cancel booking:', error);
        alert('Failed to cancel booking: ' + (error.response?.data?.Message || error.message));
      }
    }
  };

  const handleBookNewStation = () => {
    window.location.href = '/ev-owner/book-station';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-400">Manage your charging station reservations</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by booking ID or station..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:border-green-500 appearance-none min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value={BookingStatus.Pending}>Pending</option>
                  <option value={BookingStatus.Confirmed}>Confirmed</option>
                  <option value={BookingStatus.Completed}>Completed</option>
                  <option value={BookingStatus.Cancelled}>Cancelled</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleBookNewStation}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Book New Station
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.Id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                    <Battery className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Booking #{booking.Id}</h3>
                    <p className="text-gray-400 text-sm">Created {formatDateTime(booking.CreatedAt || '')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(booking.Status)}`}>
                    {getStatusIcon(booking.Status)}
                    {booking.Status}
                  </div>
                  {canCancelBooking(booking) && (
                    <button
                      onClick={() => handleCancelBooking(booking.Id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Station & Slot</p>
                    <p className="text-white font-medium">Station {booking.ChargingStationId} - Slot {booking.SlotNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Reservation</p>
                    <p className="text-white font-medium">{formatDateTime(booking.ReservationDateTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Duration</p>
                    <p className="text-white font-medium">2 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Battery className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Charging Type</p>
                    <p className="text-white font-medium">DC Fast</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Battery className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No bookings found</p>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'You haven\'t made any bookings yet'}
            </p>
            <button
              onClick={handleBookNewStation}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Book Your First Station
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EVOwnerBookingsPage;