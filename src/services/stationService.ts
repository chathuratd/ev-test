import apiClient from './api';
import { ChargingStation, DeactivateStationRequest, UpdateSlotsRequest } from '../types';

export const stationService = {
  async getAllStations(): Promise<ChargingStation[]> {
    const response = await apiClient.get<ChargingStation[]>('/ChargingStation');
    return response.data;
  },

  async getStationById(id: string): Promise<ChargingStation> {
    const response = await apiClient.get<ChargingStation>(`/ChargingStation/${id}`);
    return response.data;
  },

  async createStation(station: Partial<ChargingStation>): Promise<ChargingStation> {
    const response = await apiClient.post<ChargingStation>('/ChargingStation', station);
    return response.data;
  },

  async updateStation(id: string, station: Partial<ChargingStation>): Promise<ChargingStation> {
    const response = await apiClient.put<ChargingStation>(`/ChargingStation/${id}`, station);
    return response.data;
  },

  async updateSlots(id: string, slots: UpdateSlotsRequest): Promise<ChargingStation> {
    const response = await apiClient.patch<ChargingStation>(`/ChargingStation/${id}/slots`, slots);
    return response.data;
  },

  async deactivateStation(id: string, request: DeactivateStationRequest): Promise<void> {
    await apiClient.patch(`/ChargingStation/${id}/deactivate`, request);
  },

  async activateStation(id: string): Promise<void> {
    await apiClient.patch(`/ChargingStation/${id}/activate`);
  },
};
