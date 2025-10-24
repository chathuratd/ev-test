
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { User, UserRole, AccountStatus, ChargingStation } from '../../types';
import { stationService } from '../../services/stationService';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: AccountStatus;
    assignedStationIds: string[];
  }) => Promise<void>;
  user: User | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.StationOperator as UserRole,
    status: AccountStatus.Active as AccountStatus,
    assignedStationIds: [] as string[]
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        email: user.Email || '',
        firstName: user.FirstName || '',
        lastName: user.LastName || '',
        role: user.Role || UserRole.StationOperator,
        status: user.Status || AccountStatus.Active,
        assignedStationIds: user.AssignedStationIds || []
      });
      fetchStations();
    }
  }, [isOpen, user]);

  const fetchStations = async () => {
    try {
      setLoadingStations(true);
      const response = await stationService.getAllStations();
      if (response.Success && response.Data) {
        setStations(response.Data);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    } finally {
      setLoadingStations(false);
    }
  };

  const handleStationToggle = (stationId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedStationIds: prev.assignedStationIds.includes(stationId)
        ? prev.assignedStationIds.filter(id => id !== stationId)
        : [...prev.assignedStationIds, stationId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await onSubmit({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        status: formData.status,
        assignedStationIds: formData.assignedStationIds
      });

      onClose();
    } catch (err: any) {
      // Display backend validation errors
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit User</h2>
            <p className="text-gray-400 text-sm mt-1">Username: {user.Username}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                disabled={loading}
              />
            </div>

            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                disabled={loading}
              >
                <option value={UserRole.StationOperator}>Station Operator</option>
                <option value={UserRole.Backoffice}>Backoffice</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AccountStatus })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                disabled={loading}
              >
                <option value={AccountStatus.Active}>Active</option>
                <option value={AccountStatus.Inactive}>Inactive</option>
                <option value={AccountStatus.Suspended}>Suspended</option>
              </select>
            </div>

            {/* Assigned Stations - Only for Station Operators */}
            {formData.role === UserRole.StationOperator && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assigned Charging Stations
                </label>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {loadingStations ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : stations.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No stations available</p>
                  ) : (
                    <div className="space-y-2">
                      {stations.map((station) => (
                        <label
                          key={station.Id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-zinc-700/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedStationIds.includes(station.Id)}
                            onChange={() => handleStationToggle(station.Id)}
                            disabled={loading}
                            className="w-4 h-4 text-green-500 bg-zinc-700 border-zinc-600 rounded focus:ring-green-500 focus:ring-2"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{station.Name}</p>
                            <p className="text-gray-400 text-xs truncate">{station.Location}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              station.Status?.toLowerCase() === 'active'
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-gray-500/10 text-gray-400'
                            }`}
                          >
                            {station.Status}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  {formData.assignedStationIds.length} station(s) selected
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-zinc-800">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
