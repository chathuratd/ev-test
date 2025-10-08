import apiClient from './api';
import { 
  ChargingStation, 
  ApiResponse, 
  CreateChargingStationRequestDto, 
  UpdateChargingStationRequestDto,
  DeactivateChargingStationRequestDto,
  UpdateSlotAvailabilityRequestDto,
  DeactivateStationRequest,
  UpdateSlotsRequest,
  ChargingType
} from '../types';

export const stationService = {
  async getAllStations(onlyActive: boolean = false): Promise<ApiResponse<ChargingStation[]>> {
    const params = onlyActive ? '?onlyActive=true' : '';
    const response = await apiClient.get<ApiResponse<ChargingStation[]>>(`/ChargingStation${params}`);
    return response.data;
  },

  async getStationById(id: string): Promise<ApiResponse<ChargingStation>> {
    const response = await apiClient.get<ApiResponse<ChargingStation>>(`/ChargingStation/${id}`);
    return response.data;
  },

  async createStation(station: CreateChargingStationRequestDto): Promise<ApiResponse<ChargingStation>> {
    const response = await apiClient.post<ApiResponse<ChargingStation>>('/ChargingStation', station);
    return response.data;
  },

  async updateStation(id: string, station: UpdateChargingStationRequestDto): Promise<ApiResponse<ChargingStation>> {
    const response = await apiClient.put<ApiResponse<ChargingStation>>(`/ChargingStation/${id}`, station);
    return response.data;
  },

  async updateSlotAvailability(id: string, request: UpdateSlotAvailabilityRequestDto): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`/ChargingStation/${id}/slots`, request);
    return response.data;
  },

  async deactivateStation(id: string, request: DeactivateChargingStationRequestDto): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`/ChargingStation/${id}/deactivate`, request);
    return response.data;
  },


  async updateSlots(id: string, slots: UpdateSlotsRequest): Promise<ChargingStation> {
    const request: UpdateSlotAvailabilityRequestDto = {
      StationId: id,
      AvailableSlots: slots.availableSlots,
      TotalSlots: slots.totalSlots
    };

    const response = await this.updateSlotAvailability(id, request);
    if (response.Success) {
      // Return updated station data
      const stationResponse = await this.getStationById(id);
      if (stationResponse.Success && stationResponse.Data) {
        return stationResponse.Data;
      }
    }
    throw new Error(response.Message || 'Failed to update slots');
  },

  async deactivateStationLegacy(id: string, request: DeactivateStationRequest): Promise<void> {
    const apiRequest: DeactivateChargingStationRequestDto = {
      Reason: request.reason,
      DeactivatedBy: 'system', // You might want to get this from auth context
      EstimatedReactivationDate: request.deactivationDate
    };

    const response = await this.deactivateStation(id, apiRequest);
    if (!response.Success) {
      throw new Error(response.Message || 'Failed to deactivate station');
    }
  },

  async activateStation(id: string): Promise<void> {
    // This endpoint doesn't exist in the swagger, so we'll use update station
    const stationResponse = await this.getStationById(id);
    if (stationResponse.Success && stationResponse.Data) {
      const updateRequest: any = {
        ...stationResponse.Data,
        Status: 'Active'
      };
      const response = await this.updateStation(id, updateRequest);
      if (!response.Success) {
        throw new Error(response.Message || 'Failed to activate station');
      }
    }
  },
};
