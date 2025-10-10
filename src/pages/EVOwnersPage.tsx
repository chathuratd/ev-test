import { useEffect, useState } from 'react';
import { Search, User, Clock, Mail, Phone, Eye, UserPlus } from 'lucide-react';
import { evOwnerService } from '../services/evOwnerService';
import { EVOwner, RegisterEVOwnerRequestDto, Booking, BookingStatus } from '../types';

const EVOwnersPage = () => {
  const [evOwners, setEvOwners] = useState<EVOwner[]>([]);
  const [filteredEvOwners, setFilteredEvOwners] = useState<EVOwner[]>([]);
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

  useEffect(() => {
    fetchEvOwners();
  }, []);

  useEffect(() => {
    let filtered = evOwners;

    if (searchQuery) {
      filtered = filtered.filter(
        (owner) =>
          owner.NIC.toLowerCase().includes(searchQuery.toLowerCase()) ||
          owner.FirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          owner.LastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          owner.Email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvOwners(filtered);
  }, [searchQuery, evOwners]);

  const fetchEvOwners = async () => {
    try {
      setLoading(true);
      
      // Use fallback method that tries test endpoint first in development
      const isDevelopment = import.meta.env.DEV;
      const evOwnersData = isDevelopment ? 
        await evOwnerService.getAllEVOwnersWithFallback() : 
        await evOwnerService.getAllEVOwnersLegacy();
        
      setEvOwners(evOwnersData);
      setFilteredEvOwners(evOwnersData);
    } catch (error) {
      console.error('Failed to fetch EV owners:', error);
      setEvOwners([]);
      setFilteredEvOwners([]);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateOwner = async () => {
    try {
      if (!newOwner.NIC || !newOwner.FirstName || !newOwner.LastName || !newOwner.Email || !newOwner.Password) {
        alert('Please fill in all required fields');
        return;
      }

      if (newOwner.Password !== newOwner.ConfirmPassword) {
        alert('Passwords do not match');
        return;
      }

      const response = await evOwnerService.registerEVOwner(newOwner);
      if (response.Success && response.Data) {
        const newOwnerData: EVOwner = {
          NIC: newOwner.NIC,
          FirstName: newOwner.FirstName,
          LastName: newOwner.LastName,
          Email: newOwner.Email,
          PhoneNumber: newOwner.PhoneNumber,
          CreatedAt: new Date().toISOString(),
        };
        setEvOwners(prev => [...prev, newOwnerData]);
        setShowCreateModal(false);
        resetNewOwner();
        alert('EV Owner registered successfully!');
      } else {
        alert(response.Message || 'Failed to register EV owner');
      }
    } catch (error) {
      console.error('Failed to register EV owner:', error);
      alert('Failed to register EV owner');
    }
  };

  const resetNewOwner = () => {
    setNewOwner({
      NIC: '',
      FirstName: '',
      LastName: '',
      Email: '',
      PhoneNumber: '',
      Password: '',
      ConfirmPassword: ''
    });
  };

  const handleViewDetails = async (owner: EVOwner) => {
    setSelectedOwner(owner);
    setShowDetailsModal(true);
    
    // Fetch owner's bookings (mock data for now)
    const mockBookings: Booking[] = [
      {
        Id: '1',
        EvOwnerNic: owner.NIC,
        ChargingStationId: 'station-1',
        SlotNumber: 1,
        ReservationDateTime: '2025-10-09T10:00:00Z',
        Status: BookingStatus.Confirmed,
        CreatedAt: '2025-10-08T14:30:00Z',
      },
      {
        Id: '2',
        EvOwnerNic: owner.NIC,
        ChargingStationId: 'station-2',
        SlotNumber: 2,
        ReservationDateTime: '2025-10-07T14:00:00Z',
        Status: BookingStatus.Completed,
        CreatedAt: '2025-10-07T12:15:00Z',
      },
    ];
    setOwnerBookings(mockBookings);
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Register EV Owner
          </button>
        </div>

        <div className="grid gap-4">
          {filteredEvOwners.map((owner) => (
            <div key={owner.NIC} className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-zinc-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{owner.FirstName} {owner.LastName}</h3>
                    <p className="text-gray-400 text-sm">NIC: {owner.NIC}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(owner)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
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

        {filteredEvOwners.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No EV owners found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search criteria or register a new EV owner</p>
          </div>
        )}
      </div>

      {/* Create EV Owner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Register New EV Owner</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">NIC *</label>
                <input
                  type="text"
                  value={newOwner.NIC}
                  onChange={(e) => setNewOwner({...newOwner, NIC: e.target.value})}
                  placeholder="Enter NIC number"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={newOwner.Email}
                  onChange={(e) => setNewOwner({...newOwner, Email: e.target.value})}
                  placeholder="Enter email address"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  value={newOwner.FirstName}
                  onChange={(e) => setNewOwner({...newOwner, FirstName: e.target.value})}
                  placeholder="Enter first name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  value={newOwner.LastName}
                  onChange={(e) => setNewOwner({...newOwner, LastName: e.target.value})}
                  placeholder="Enter last name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={newOwner.PhoneNumber}
                  onChange={(e) => setNewOwner({...newOwner, PhoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  value={newOwner.Password}
                  onChange={(e) => setNewOwner({...newOwner, Password: e.target.value})}
                  placeholder="Enter password"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password *</label>
                <input
                  type="password"
                  value={newOwner.ConfirmPassword}
                  onChange={(e) => setNewOwner({...newOwner, ConfirmPassword: e.target.value})}
                  placeholder="Confirm password"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateOwner}
                className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg transition-colors"
              >
                Register EV Owner
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetNewOwner();
                }}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Owner Information */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Personal Information</h4>
                <div className="space-y-3">
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
