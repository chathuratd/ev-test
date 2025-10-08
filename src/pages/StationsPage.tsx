import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { stationService } from '../services/stationService';
import { ChargingStation } from '../types';

const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<ChargingStation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = stations.filter(
        (station) =>
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStations(filtered);
    } else {
      setFilteredStations(stations);
    }
  }, [searchQuery, stations]);

  const fetchStations = async () => {
    try {
      const data = await stationService.getAllStations();
      setStations(data);
      setFilteredStations(data);
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      const mockData: ChargingStation[] = [
        {
          id: '1',
          name: 'Downtown Charging Hub',
          location: 'Colombo 03',
          address: '123 Galle Road, Colombo 03',
          latitude: 6.9271,
          longitude: 79.8612,
          description: '24/7 charging facility',
          chargingType: 'Both',
          totalSlots: 8,
          availableSlots: 5,
          powerCapacity: '50KW DC / 22KW AC',
          pricePerHour: 500,
          operatingHours: { start: '00:00', end: '23:59' },
          amenities: ['WiFi', 'Parking', 'Restroom'],
          assignedOperators: ['OP001', 'OP002'],
          status: 'active',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          name: 'Airport Express Station',
          location: 'Katunayake',
          address: 'Airport Road, Katunayake',
          latitude: 7.1807,
          longitude: 79.8842,
          description: '24/7 express charging',
          chargingType: 'DC',
          totalSlots: 12,
          availableSlots: 8,
          powerCapacity: '150KW DC',
          pricePerHour: 750,
          operatingHours: { start: '00:00', end: '23:59' },
          amenities: ['WiFi', 'Parking', 'Cafe'],
          assignedOperators: ['OP003'],
          status: 'active',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '3',
          name: 'Mall Parking Chargers',
          location: 'Rajagiriya',
          address: 'One Galle Face Mall, Rajagiriya',
          latitude: 6.9105,
          longitude: 79.8897,
          description: 'Shopping mall parking',
          chargingType: 'AC',
          totalSlots: 6,
          availableSlots: 6,
          powerCapacity: '22KW AC',
          pricePerHour: 400,
          operatingHours: { start: '10:00', end: '22:00' },
          amenities: ['WiFi', 'Parking', 'Shopping'],
          assignedOperators: ['OP004'],
          status: 'inactive',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];
      setStations(mockData);
      setFilteredStations(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDeactivate = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'active') {
        navigate(`/stations/${id}/deactivate`);
      } else {
        await stationService.activateStation(id);
        fetchStations();
      }
    } catch (error) {
      console.error('Failed to update station status:', error);
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
        <h1 className="text-3xl font-bold text-white mb-2">Charging Stations</h1>
        <p className="text-gray-400">Manage charging station locations, types, and availability</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stations by name, location, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <button
            onClick={() => navigate('/stations/new')}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors ml-4"
          >
            <Plus className="w-5 h-5" />
            Add Station
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Station Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Location</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Slots</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Power</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.map((station) => (
                <tr key={station.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{station.name}</p>
                      <p className="text-gray-400 text-sm">{station.operatingHours.start === '00:00' && station.operatingHours.end === '23:59' ? '24/7' : `${station.operatingHours.start} - ${station.operatingHours.end}`}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white">{station.location}</p>
                      <p className="text-gray-400 text-sm">{station.address}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                        station.chargingType === 'DC'
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                          : station.chargingType === 'AC'
                          ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                          : 'bg-green-500/10 border-green-500/50 text-green-400'
                      }`}
                    >
                      {station.chargingType}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">
                        {station.availableSlots} / {station.totalSlots}
                      </p>
                      <p className="text-gray-400 text-sm">available</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{station.powerCapacity}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        station.status === 'active'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {station.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/stations/${station.id}/edit`)}
                        className="text-white hover:text-green-400 font-medium text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleActivateDeactivate(station.id, station.status)}
                        className={`font-medium text-sm transition-colors ${
                          station.status === 'active'
                            ? 'text-gray-400 hover:text-red-400'
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {station.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No stations found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationsPage;
