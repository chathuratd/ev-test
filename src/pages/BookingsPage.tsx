import { useEffect, useState } from 'react';
import { Search, Filter, Calendar, Clock, MapPin, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { stationService } from '../services/stationService';
import { Booking, BookingStatus, ChargingStation, UserRole } from '../types';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Local input state so we only submit when the user presses Enter
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isStationOperator = user?.Role === UserRole.StationOperator;

  useEffect(() => {
    fetchStations();
  }, []);

  // THIN CLIENT: Fetch bookings from backend with filters
  // Only fetch when the committed `searchQuery` changes (set on Enter) or statusFilter changes
  useEffect(() => {
    fetchBookings();
  }, [searchQuery, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      let response;

      // Station Operators only see bookings for their assigned stations
      if (isStationOperator && user?.Id) {
        response = await bookingService.getBookingsByOperator(user.Id);
      } else {
        // Backoffice users see all bookings
        const params = {
          page: 1,
          pageSize: 100,
          status: statusFilter !== 'all' ? statusFilter : undefined
        };
        response = await bookingService.getAllBookings(params);
      }

      if (response.Success && response.Data) {
        setBookings(response.Data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      let stationsResponse;

      // Station Operators only see their assigned stations
      if (isStationOperator && user?.Id) {
        stationsResponse = await stationService.getStationsByOperator(user.Id);
      } else {
        // Backoffice users see all stations
        stationsResponse = await stationService.getAllStations();
      }

      if (stationsResponse.Success && stationsResponse.Data) {
        setStations(stationsResponse.Data);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      switch (newStatus) {
        case BookingStatus.Confirmed:
          await bookingService.confirmBookingLegacy(bookingId);
          break;
        case BookingStatus.Completed:
          await bookingService.completeBookingLegacy(bookingId);
          break;
        case BookingStatus.Cancelled:
          await bookingService.cancelBookingLegacy(bookingId, 'Cancelled by operator');
          break;
      }
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.Id === bookingId ? { ...booking, Status: newStatus } : booking
        )
      );
      
      alert(`Booking ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update booking status');
    }
  };


  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case BookingStatus.Confirmed:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case BookingStatus.Completed:
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case BookingStatus.Cancelled:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.Pending:
        return <Clock className="w-4 h-4" />;
      case BookingStatus.Confirmed:
        return <CheckCircle className="w-4 h-4" />;
      case BookingStatus.Completed:
        return <CheckCircle className="w-4 h-4" />;
      case BookingStatus.Cancelled:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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

  const getStationName = (stationId: string) => {
    const station = stations.find(s => s.Id === stationId);
    return station?.Name || `Station ${stationId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bookings</h1>
        <p className="text-gray-400">Manage charging station bookings and reservations</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by EV Owner NIC, Booking ID, or Station..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchInput);
                  }
                }}
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
        </div>

        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.Id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-zinc-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Booking #{booking.Id}</h3>
                    <p className="text-gray-400 text-sm">Created {formatDateTime(booking.CreatedAt || '')}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(booking.Status)}`}>
                    {getStatusIcon(booking.Status)}
                    {booking.Status}
                  </div>
                </div>
                <div className="flex gap-2">
                  {booking.Status === BookingStatus.Pending && (
                    <>
                      <button
                        onClick={() => handleStatusChange(booking.Id, BookingStatus.Confirmed)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusChange(booking.Id, BookingStatus.Cancelled)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.Status === BookingStatus.Confirmed && (
                    <button
                      onClick={() => handleStatusChange(booking.Id, BookingStatus.Completed)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">EV Owner</p>
                    <p className="text-white font-medium">{booking.EvOwnerNic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Station & Slot</p>
                    <p className="text-white font-medium">{getStationName(booking.ChargingStationId)} - Slot {booking.SlotNumber}</p>
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
              </div>
            </div>
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No bookings found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search criteria or create a new booking</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
