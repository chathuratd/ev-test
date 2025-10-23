import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { stationService } from '../services/stationService';
import { ChargingStation } from '../types';

const DeactivateStationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [station, setStation] = useState<ChargingStation | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    reason: '',
    estimatedReactivationDate: ''
  });

  useEffect(() => {
    fetchStation();
  }, [id]);

  const fetchStation = async () => {
    try {
      const response = await stationService.getStationById(id!);
      if (response.Success && response.Data) {
        setStation(response.Data);

        // Check if station is already inactive
        if (response.Data.Status?.toLowerCase() !== 'active') {
          setError('This station is not active and cannot be deactivated.');
        }
      }
    } catch (err) {
      console.error('Failed to fetch station:', err);
      setError('Failed to load station details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      setError('Please provide a reason for deactivation');
      return;
    }

    if (station?.Status?.toLowerCase() !== 'active') {
      setError('This station is not active and cannot be deactivated.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await stationService.deactivateStation(id!, {
        Reason: formData.reason,
        DeactivatedBy: 'system', // TODO: Get from auth context
        EstimatedReactivationDate: formData.estimatedReactivationDate || undefined
      });

      navigate('/stations');
    } catch (err: any) {
      console.error('Failed to deactivate station:', err);
      setError(err.response?.data?.Message || 'Failed to deactivate station. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/stations');
  };

  if (!station) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Stations
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Deactivate Station</h1>
        <p className="text-gray-400">Provide a reason for deactivating {station.Name}</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {station.Status?.toLowerCase() === 'active' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Station Information</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">
                  <span className="text-white">Name:</span> {station.Name}
                </p>
                <p className="text-gray-400">
                  <span className="text-white">Location:</span> {station.Location}
                </p>
                <p className="text-gray-400">
                  <span className="text-white">Current Status:</span>{' '}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400">
                    {station.Status}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for Deactivation <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Enter the reason for deactivating this station..."
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Reactivation Date (Optional)
              </label>
              <input
                type="date"
                value={formData.estimatedReactivationDate}
                onChange={(e) => setFormData({ ...formData, estimatedReactivationDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deactivating...' : 'Deactivate Station'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">This station is already inactive.</p>
            <button
              onClick={handleCancel}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Back to Stations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeactivateStationPage;
