import { useState, useEffect } from 'react';
import { MapPin, Battery, Users, Zap, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { ChargingStation, CreateBookingRequestDto } from '../types';
import { stationService } from '../services/stationService';
import apiClient from '../services/api';

const EVOwnerBookStationPage = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await stationService.getAllStations();
      setStations(response.Data || []);
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      setError('Failed to load charging stations');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlots = (station: ChargingStation) => {
    // NOTE: Real slot availability should come from API endpoint
    // Currently, no API endpoint exists for checking real-time slot availability
    // Using station's AvailableSlots count as approximation
    const totalSlots = station.TotalSlots;
    const availableCount = station.AvailableSlots;
    
    const availableSlots = [];
    for (let i = 1; i <= Math.min(availableCount, totalSlots); i++) {
      availableSlots.push(i);
    }
    return availableSlots;
  };

  const getChargingTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ac':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'dc':
        return <Battery className="w-4 h-4 text-green-400" />;
      default:
        return <Battery className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatLocationName = (location: string) => {
    try {
      const parsed = JSON.parse(location);
      return `${parsed.address || ''}, ${parsed.city || ''}`.trim().replace(/^,\s*/, '');
    } catch {
      return location;
    }
  };

  const handleStationSelect = (station: ChargingStation) => {
    setSelectedStation(station);
    setSelectedSlot(null);
    setError('');
  };

  const handleSlotSelect = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setError('');
  };

  const handleBooking = async () => {
    if (!selectedStation || !selectedSlot || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate date and time
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      setError('Please select a future date and time');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Get user NIC from localStorage
      const userNic = localStorage.getItem('userNic') || localStorage.getItem('evOwnerNic');
      
      if (!userNic) {
        setError('User not logged in. Please login first.');
        setTimeout(() => window.location.href = '/ev-owner-login', 2000);
        return;
      }

      const bookingRequest: CreateBookingRequestDto = {
        EvOwnerNic: userNic,
        ChargingStationId: selectedStation.Id,
        SlotNumber: selectedSlot,
        ReservationDateTime: selectedDateTime.toISOString(),
      };

      // Call the real booking API
      const response = await apiClient.post('/api/v1/Booking', bookingRequest);
      
      if (response.data.Success) {
        setBookingSuccess(true);
      } else {
        throw new Error(response.data.Message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToStations = () => {
    setSelectedStation(null);
    setSelectedSlot(null);
    setError('');
  };

  const handleViewBookings = () => {
    window.location.href = '/ev-owner/bookings';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-gray-400 mb-6">
              Your charging station reservation has been successfully created.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleViewBookings}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => window.location.href = '/ev-owner-dashboard'}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
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
          <div className="flex items-center gap-4 mb-4">
            {selectedStation && (
              <button
                onClick={handleBackToStations}
                className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {selectedStation ? 'Book Charging Slot' : 'Book Charging Station'}
              </h1>
              <p className="text-gray-400">
                {selectedStation ? 'Select your preferred time slot' : 'Choose a charging station near you'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {!selectedStation ? (
          // Station Selection
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => {
              const availableSlots = getAvailableSlots(station);
              return (
                <div
                  key={station.Id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors cursor-pointer"
                  onClick={() => handleStationSelect(station)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg">{station.Name}</h3>
                    <div className="flex items-center gap-1">
                      {getChargingTypeIcon(station.ChargingType)}
                      <span className="text-sm text-gray-400">{station.ChargingType}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{formatLocationName(station.Location)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">
                        {availableSlots.length} of {station.TotalSlots} slots available
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{station.PowerOutput || 50}kW</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-medium">
                        {availableSlots.length > 0 ? 'Available Now' : 'Fully Booked'}
                      </span>
                      <span className="text-gray-400 text-sm">Click to book</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Booking Form
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Station Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-white font-semibold text-xl mb-4">Selected Station</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium">{selectedStation.Name}</h4>
                  <p className="text-gray-400 text-sm">{formatLocationName(selectedStation.Location)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Charging Type</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getChargingTypeIcon(selectedStation.ChargingType)}
                      <span className="text-white">{selectedStation.ChargingType}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Power</p>
                    <p className="text-white font-medium">{selectedStation.PowerOutput || 50}kW</p>
                  </div>
                </div>

                {/* Slot Selection */}
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Available Slots</p>
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailableSlots(selectedStation).map((slotNumber) => (
                      <button
                        key={slotNumber}
                        onClick={() => handleSlotSelect(slotNumber)}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          selectedSlot === slotNumber
                            ? 'bg-green-500/20 border-green-500 text-green-400'
                            : 'bg-zinc-800 border-zinc-700 text-gray-300 hover:border-zinc-600'
                        }`}
                      >
                        Slot {slotNumber}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-white font-semibold text-xl mb-4">Booking Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Duration (hours)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={6}>6 hours</option>
                    <option value={8}>8 hours</option>
                  </select>
                </div>

                {selectedSlot && (
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Station:</span>
                        <span className="text-white">{selectedStation.Name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Slot:</span>
                        <span className="text-white">Slot {selectedSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date & Time:</span>
                        <span className="text-white">
                          {selectedDate && selectedTime 
                            ? `${selectedDate} at ${selectedTime}`
                            : 'Not selected'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{duration} hours</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={submitting || !selectedSlot || !selectedDate || !selectedTime}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {submitting ? 'Creating Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EVOwnerBookStationPage;