import { useState, useEffect } from 'react';
import { MapPin, Battery, Clock, Car, Phone, Search, Filter } from 'lucide-react';
import { ChargingStation, ChargingType } from '../types';
import apiClient from '../services/api';

const EVOwnerStationsPage = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChargingType | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // THIN CLIENT: Fetch stations from backend with filtering
  useEffect(() => {
    fetchStations();
  }, [searchQuery, typeFilter]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for backend filtering
      const params = new URLSearchParams();
      if (searchQuery) params.append('searchTerm', searchQuery);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('page', '1');
      params.append('pageSize', '100');
      
      const response = await apiClient.get(`/api/v1/ChargingStation/search?${params.toString()}`);
      if (response.data.Success && response.data.Data) {
        setStations(response.data.Data);
      } else {
        setStations([]);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookStation = (stationId: string) => {
    // Navigate to booking page with station pre-selected
    window.location.href = `/ev-owner/book-station?station=${stationId}`;
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
          <h1 className="text-3xl font-bold text-white mb-2">Find Charging Stations</h1>
          <p className="text-gray-400">Discover available charging stations near you</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stations by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ChargingType | 'all')}
                className="bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:border-green-500 appearance-none min-w-[150px]"
              >
                <option value="all">All Types</option>
                <option value={ChargingType.AC}>AC Charging</option>
                <option value={ChargingType.DC}>DC Fast Charging</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid gap-6">
          {stations.map((station) => (
            <div key={station.Id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
                    <Battery className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{station.Name}</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{station.Location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300">{station.ChargingType} Charging</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">24/7 Available</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookStation(station.Id)}
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Book Now
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-zinc-800">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Slots</p>
                  <p className="text-white font-semibold">{station.TotalSlots}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Available</p>
                  <p className="text-green-400 font-semibold">{station.AvailableSlots || station.TotalSlots - 2}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Charging Rate</p>
                  <p className="text-white font-semibold">{station.PowerOutput || 'N/A'}kW</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Contact</p>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <p className="text-white text-sm">Call Station</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stations.length === 0 && (
          <div className="text-center py-12">
            <Battery className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No stations found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Map Placeholder */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="text-center">
            <MapPin className="mx-auto w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Interactive Station Map</h3>
            <p className="text-gray-400 text-sm mb-4">View all charging stations on an interactive map</p>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-12">
              <p className="text-gray-500">Map integration coming soon...</p>
              <p className="text-gray-600 text-sm mt-2">Will show real-time station availability and navigation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVOwnerStationsPage;