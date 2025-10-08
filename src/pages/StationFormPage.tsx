import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { stationService } from '../services/stationService';

const StationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    description: '',
    type: 'AC' as 'AC' | 'DC' | 'Both',
    totalSlots: '',
    availableSlots: '',
    pricePerHour: '',
    operatingHoursStart: '00:00',
    operatingHoursEnd: '23:59',
    amenities: [] as string[],
  });

  useEffect(() => {
    if (isEdit) {
      fetchStation();
    }
  }, [id]);

  const fetchStation = async () => {
    try {
      const station = await stationService.getStationById(id!);
      console.log(station);
      setFormData({
        id: station.Data.Id,
        name: station.Data.Name,
        location: station.Data.Location,
        latitude: station.Data.Latitude.toString(),
        longitude: station.Data.Longitude.toString(),
        description: station.Data.Description || '',
        type: station.Data.Type,
        totalSlots: station.Data.TotalSlots.toString(),
        availableSlots: station.Data.AvailableSlots.toString(),
        pricePerHour: station.Data.PricePerHour.toString(),
        operatingHoursStart: station.Data.OperatingHours?.OpenTime as string || '00:00',
        operatingHoursEnd: station.Data.OperatingHours?.CloseTime as string || '23:59',
        amenities: station.Data.Amenities as string[] || [],
      });
    } catch (error) {
      console.error('Failed to fetch station:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const stationData = {
        Id: id ?? '', // Ensure Id is always a string
        Name: formData.name,
        Location: formData.location,
        Latitude: parseFloat(formData.latitude),
        Longitude: parseFloat(formData.longitude),
        Description: formData.description,
        Type: formData.type as any,
        TotalSlots: parseInt(formData.totalSlots),
        AvailableSlots: parseInt(formData.availableSlots),
        PricePerHour: parseFloat(formData.pricePerHour),
        OperatingHoursStart: formData.operatingHoursStart,
        OperatingHoursEnd: formData.operatingHoursEnd,
        Amenities: formData.amenities,
      };

      if (isEdit) {
        await stationService.updateStation(id!, stationData);
      } else {
        await stationService.createStation(stationData as any);
      }

      navigate('/stations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save station');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const availableAmenities = ['WiFi', 'Parking', 'Restroom', 'Cafe', 'Shopping', 'Security'];

  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  return (
    <div>
      <button
        onClick={() => navigate('/stations')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Stations
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isEdit ? 'Edit Charging Station' : 'Add New Charging Station'}
        </h1>
        <p className="text-gray-400">
          {isEdit ? 'Update station details and configuration' : 'Create a new charging station'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Station Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Location <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Latitude <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Longitude <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Charging Type <span className="text-red-400">*</span>
              </label>
              <select
                name="chargingType"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              >
                <option value="AC">AC</option>
                <option value="DC">DC</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Total Slots <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="totalSlots"
                value={formData.totalSlots}
                onChange={handleChange}
                required
                min="1"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Available Slots <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="availableSlots"
                value={formData.availableSlots}
                onChange={handleChange}
                required
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Price per Hour (LKR) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Operating Hours - Start <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                name="operatingHoursStart"
                value={formData.operatingHoursStart}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Operating Hours - End <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                name="operatingHoursEnd"
                value={formData.operatingHoursEnd}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">Amenities</label>
            <div className="flex flex-wrap gap-3">
              {availableAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.amenities.includes(amenity)
                      ? 'bg-green-500/10 border-green-500 text-green-400'
                      : 'bg-zinc-800 border-zinc-700 text-gray-400 hover:border-green-500 hover:text-green-400'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Station' : 'Create Station'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/stations')}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StationFormPage;
