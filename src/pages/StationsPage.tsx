import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { stationService } from '../services/stationService';
import { ChargingStation } from '../types';
import apiClient from '../services/api';

const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // THIN CLIENT: Fetch stations from backend with search filtering
  useEffect(() => {
    fetchStations();
  }, [searchQuery]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      
      // Use backend search endpoint with query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('searchTerm', searchQuery);
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
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Price Per Hour</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station.Id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{station.Name}</p>
                      <p className="text-gray-400 text-sm">{station.OperatingHours?.OpenTime === '00:00' && station.OperatingHours?.CloseTime === '23:59' ? '24/7' : `${station.OperatingHours?.OpenTime} - ${station.OperatingHours?.CloseTime}`}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white">{station.Location}</p>
                      {/* <p className="text-gray-400 text-sm">{station.Address}</p> */}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                        station.Type === 'DC'
                          ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                          : station.Type === 'AC'
                          ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                          : 'bg-green-500/10 border-green-500/50 text-green-400'
                      }`}
                    >
                      {station.Type}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">
                        {station.AvailableSlots} / {station.TotalSlots}
                      </p>
                      <p className="text-gray-400 text-sm">available</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{station.PricePerHour}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        station.Status === 'active'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {station.Status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/stations/${station.Id}/edit`)}
                        className="text-white hover:text-green-400 font-medium text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleActivateDeactivate(station.Id, station.Status as string)}
                        className={`font-medium text-sm transition-colors ${
                          station.Status === 'active'
                            ? 'text-gray-400 hover:text-red-400'
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {station.Status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {stations.length === 0 && (
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
