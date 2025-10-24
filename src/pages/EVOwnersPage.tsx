import { useEffect, useState } from 'react';
import { Search, User, Clock, Mail, Phone, Eye, UserPlus, UserCheck } from 'lucide-react';
import { evOwnerService } from '../services/evOwnerService';
import { EVOwner, RegisterEVOwnerRequestDto, Booking, BookingStatus, AccountStatus } from '../types';
import apiClient from '../services/api';

const EVOwnersPage = () => {
  const [evOwners, setEvOwners] = useState<EVOwner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<EVOwner | null>(null);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [newOwner, setNewOwner] = useState<RegisterEVOwnerRequestDto>({
    NIC: '',
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: '',
    Password: '',
    ConfirmPassword: ''
  });

  // THIN CLIENT: Fetch EV owners from backend with filtering
  useEffect(() => {
    fetchEvOwners();
  }, []);

  const fetchEvOwners = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for backend filtering
      const params = new URLSearchParams();
      if (searchQuery) params.append('searchTerm', searchQuery);
      params.append('page', '1');
      params.append('pageSize', '100');
      
      const response = await apiClient.get(`/EVOwners?${params.toString()}`);
      
      if (response.data.Success && response.data.Data) {
        setEvOwners(response.data.Data);
      }
    } catch (error) {
      console.error('Failed to fetch EV owners:', error);
      setEvOwners([]);
    } finally {
      setLoading(false);
    }
  };


  const handleViewDetails = async (owner: EVOwner) => {
    setSelectedOwner(owner);
    setShowDetailsModal(true);
    
    // THIN CLIENT: Fetch owner's bookings from backend
    try {
      const response = await apiClient.get(`/Booking/evowner/${owner.NIC}`);
      if (response.data.Success && response.data.Data) {
        setOwnerBookings(response.data.Data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setOwnerBookings([]);
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

  const getAccountStatusColor = (status?: AccountStatus) => {
    switch (status) {
      case AccountStatus.Active:
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case AccountStatus.Inactive:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case AccountStatus.Suspended:
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-green-500/10 text-green-400 border-green-500/20'; // Default to Active
    }
  };

  const handleActivateOwner = async (nic: string) => {
    if (window.confirm('Are you sure you want to activate this EV owner?')) {
      try {
        const response = await evOwnerService.activateEVOwner(nic);
        if (response.Success) {
          // Refresh the list to show updated status
          fetchEvOwners();
          alert('EV owner activated successfully!');
        } else {
          alert(`Failed to activate EV owner: ${response.Message}`);
        }
      } catch (error: any) {
        console.error('Failed to activate EV owner:', error);
        alert(`Failed to activate EV owner: ${error.message || 'Unknown error'}`);
      }
    }
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
        <h1 className="text-3xl font-bold text-white mb-2">EV Owners</h1>
        <p className="text-gray-400">Manage electric vehicle owners and their profiles</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by NIC, name, email, or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {evOwners.map((owner) => (
            <div key={owner.NIC} className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-zinc-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-lg">{owner.FirstName} {owner.LastName}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getAccountStatusColor(owner.Status)}`}>
                        {owner.Status || 'Active'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">NIC: {owner.NIC}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {owner.Status === AccountStatus.Inactive && (
                    <button
                      onClick={() => handleActivateOwner(owner.NIC)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <UserCheck className="w-4 h-4" />
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(owner)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Email</p>
                    <p className="text-white font-medium">{owner.Email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Phone</p>
                    <p className="text-white font-medium">{owner.PhoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Registered</p>
                    <p className="text-white font-medium">{formatDateTime(owner.CreatedAt || '')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {evOwners.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No EV owners found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search criteria or register a new EV owner</p>
          </div>
        )}
      </div>

      {/* Owner Details Modal */}
      {showDetailsModal && selectedOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">EV Owner Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Owner Information */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Full Name</p>
                    <p className="text-white font-medium">{selectedOwner.FirstName} {selectedOwner.LastName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">NIC</p>
                    <p className="text-white font-medium">{selectedOwner.NIC}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-medium">{selectedOwner.Email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white font-medium">{selectedOwner.PhoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Account Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getAccountStatusColor(selectedOwner.Status)}`}>
                      {selectedOwner.Status || 'Active'}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Registration Date</p>
                    <p className="text-white font-medium">{formatDateTime(selectedOwner.CreatedAt || '')}</p>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Bookings</h4>
                <div className="space-y-3">
                  {ownerBookings.map((booking) => (
                    <div key={booking.Id} className="bg-zinc-700 border border-zinc-600 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Booking #{booking.Id}</p>
                          <p className="text-gray-400 text-sm">Station {booking.ChargingStationId} - Slot {booking.SlotNumber}</p>
                          <p className="text-gray-400 text-sm">{formatDateTime(booking.ReservationDateTime)}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(booking.Status)}`}>
                          {booking.Status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {ownerBookings.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No booking history found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EVOwnersPage;
