import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { stationService } from '../services/stationService';
import { ChargingStation, UserRole } from '../types';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStationOperator = user?.Role === UserRole.StationOperator;

  // THIN CLIENT: Fetch stations from backend with search filtering
  useEffect(() => {
    fetchStations();
  }, [searchQuery]);

  const fetchStations = async () => {
    try {
      setLoading(true);

      let response;

      // Station Operators only see their assigned stations
      if (isStationOperator && user?.Id) {
        response = await stationService.getStationsByOperator(user.Id);
      } else {
        // Backoffice users see all stations
        response = await stationService.getAllStations();
      }

      if (response.Success && response.Data) {
        setStations(response.Data);
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
      const normalizedStatus = currentStatus?.toLowerCase();

      if (normalizedStatus === 'active') {
        // Navigate to deactivation page (only active stations can be deactivated)
        navigate(`/stations/${id}/deactivate`);
      } else {
        // Activate the station (only inactive stations can be activated)
        await stationService.activateStation(id);
        fetchStations();
      }
    } catch (error: any) {
      console.error('Failed to update station status:', error);
      alert(error.message || 'Failed to update station status. Please try again.');
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
          {!isStationOperator && (
            <button
              onClick={() => navigate('/stations/new')}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors ml-4"
            >
              <Plus className="w-5 h-5" />
              Add Station
            </button>
          )}
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
                        station.Status?.toLowerCase() === 'active'
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
                      {station.Status?.toLowerCase() === 'active' && !isStationOperator ? (
                        <button
                          onClick={() => handleActivateDeactivate(station.Id, station.Status as string)}
                          className="text-gray-400 hover:text-red-400 font-medium text-sm transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        // Only Backoffice can activate stations
                        !isStationOperator && (
                          <button
                            onClick={() => handleActivateDeactivate(station.Id, station.Status as string)}
                            className="text-green-400 hover:text-green-300 font-medium text-sm transition-colors"
                          >
                            Activate
                          </button>
                        )
                      )}
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
