import { ChargingStation, DeactivateStationRequest, UpdateSlotsRequest } from '../types';
import { MOCK_STATIONS } from '../data/mockData';

// Create a mutable copy of stations for in-memory operations
let stations = [...MOCK_STATIONS];

export const stationService = {
  async getAllStations(): Promise<ChargingStation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...stations];
  },

  async getStationById(id: string): Promise<ChargingStation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const station = stations.find(s => s.id === id);
    if (!station) {
      throw new Error('Station not found');
    }
    return { ...station };
  },

  async createStation(stationData: Partial<ChargingStation>): Promise<ChargingStation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newStation: ChargingStation = {
      id: `station_${Date.now()}`,
      name: stationData.name || '',
      location: stationData.location || '',
      address: stationData.address || '',
      latitude: stationData.latitude || 0,
      longitude: stationData.longitude || 0,
      description: stationData.description || '',
      chargingType: stationData.chargingType || 'AC',
      totalSlots: stationData.totalSlots || 1,
      availableSlots: stationData.availableSlots || stationData.totalSlots || 1,
      powerCapacity: stationData.powerCapacity || '22kW',
      pricePerHour: stationData.pricePerHour || 15.00,
      operatingHours: stationData.operatingHours || { start: '08:00', end: '18:00' },
      amenities: stationData.amenities || [],
      assignedOperators: stationData.assignedOperators || [],
      status: stationData.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    stations.push(newStation);
    return { ...newStation };
  },

  async updateStation(id: string, stationData: Partial<ChargingStation>): Promise<ChargingStation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const stationIndex = stations.findIndex(s => s.id === id);
    if (stationIndex === -1) {
      throw new Error('Station not found');
    }

    const updatedStation = {
      ...stations[stationIndex],
      ...stationData,
      updatedAt: new Date().toISOString()
    };

    stations[stationIndex] = updatedStation;
    return { ...updatedStation };
  },

  async updateSlots(id: string, slots: UpdateSlotsRequest): Promise<ChargingStation> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const stationIndex = stations.findIndex(s => s.id === id);
    if (stationIndex === -1) {
      throw new Error('Station not found');
    }

    const updatedStation = {
      ...stations[stationIndex],
      totalSlots: slots.totalSlots,
      availableSlots: slots.availableSlots,
      updatedAt: new Date().toISOString()
    };

    stations[stationIndex] = updatedStation;
    return { ...updatedStation };
  },

  async deactivateStation(id: string, request: DeactivateStationRequest): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stationIndex = stations.findIndex(s => s.id === id);
    if (stationIndex === -1) {
      throw new Error('Station not found');
    }

    stations[stationIndex] = {
      ...stations[stationIndex],
      status: 'inactive',
      updatedAt: new Date().toISOString()
    };
    
    // Log the deactivation reason (in a real app, this would be saved to the database)
    console.log(`Station ${id} deactivated. Reason: ${request.reason}, Date: ${request.deactivationDate}`);
  },

  async activateStation(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stationIndex = stations.findIndex(s => s.id === id);
    if (stationIndex === -1) {
      throw new Error('Station not found');
    }

    stations[stationIndex] = {
      ...stations[stationIndex],
      status: 'active',
      updatedAt: new Date().toISOString()
    };
  },
};
