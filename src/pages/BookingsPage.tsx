import { useEffect, useState } from 'react';
import { Search, Filter, Calendar, Clock, MapPin, User, Plus, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { stationService } from '../services/stationService';
import { Booking, BookingStatus, ChargingStation, CreateBookingRequestDto } from '../types';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBooking, setNewBooking] = useState<CreateBookingRequestDto>({
    EvOwnerNic: '',
    ChargingStationId: '',
    SlotNumber: 1,
    ReservationDateTime: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    if (searchQuery) {
      filtered = filtered.filter(
        (booking) =>
          booking.EvOwnerNic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.Id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.ChargingStationId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.Status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [searchQuery, statusFilter, bookings]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stations
      const stationsResponse = await stationService.getAllStations();
      if (stationsResponse.Success && stationsResponse.Data) {
        setStations(stationsResponse.Data);
      }

      // Fetch all bookings using the new method
      const bookingsResponse = await bookingService.getAllBookings();
      if (bookingsResponse.Success && bookingsResponse.Data) {
        setBookings(bookingsResponse.Data);
        setFilteredBookings(bookingsResponse.Data);
      } else {
        console.warn('Bookings API returned no data:', bookingsResponse.Message);
        setBookings([]);
        setFilteredBookings([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setBookings([]);
      setFilteredBookings([]);
    } finally {
      setLoading(false);
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

  const handleCreateBooking = async () => {
    try {
      if (!newBooking.EvOwnerNic || !newBooking.ChargingStationId || !newBooking.ReservationDateTime) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await bookingService.createBooking(newBooking);
      if (response.Success && response.Data) {
        setBookings(prev => [...prev, response.Data]);
        setShowCreateModal(false);
        setNewBooking({
          EvOwnerNic: '',
          ChargingStationId: '',
          SlotNumber: 1,
          ReservationDateTime: ''
        });
        alert('Booking created successfully!');
      } else {
        alert(response.Message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking');
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Booking
          </button>
        </div>

        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
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

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No bookings found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search criteria or create a new booking</p>
          </div>
        )}
      </div>

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Booking</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">EV Owner NIC</label>
                <input
                  type="text"
                  value={newBooking.EvOwnerNic}
                  onChange={(e) => setNewBooking({...newBooking, EvOwnerNic: e.target.value})}
                  placeholder="Enter EV Owner NIC"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Charging Station</label>
                <select
                  value={newBooking.ChargingStationId}
                  onChange={(e) => setNewBooking({...newBooking, ChargingStationId: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="">Select a station</option>
                  {stations.map(station => (
                    <option key={station.Id} value={station.Id}>{station.Name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Slot Number</label>
                <input
                  type="number"
                  min="1"
                  value={newBooking.SlotNumber}
                  onChange={(e) => setNewBooking({...newBooking, SlotNumber: parseInt(e.target.value) || 1})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Reservation Date & Time</label>
                <input
                  type="datetime-local"
                  value={newBooking.ReservationDateTime.slice(0, 16)}
                  onChange={(e) => setNewBooking({...newBooking, ReservationDateTime: e.target.value + ':00Z'})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateBooking}
                className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg transition-colors"
              >
                Create Booking
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
