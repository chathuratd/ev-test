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

  // Legacy methods for backward compatibility
  async getAllStationsLegacy(): Promise<ChargingStation[]> {
    const response = await this.getAllStations();
    return response.Success && response.Data ? response.Data : [];
  },

  async getStationByIdLegacy(id: string): Promise<ChargingStation> {
    const response = await this.getStationById(id);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Station not found');
  },

  async createStationLegacy(station: Partial<ChargingStation>): Promise<ChargingStation> {
    // Convert legacy format to API format
    const createRequest: CreateChargingStationRequestDto = {
      Name: station.Name || '',
      Location: station.Location || '',
      Latitude: station.Latitude || 0,
      Longitude: station.Longitude || 0,
      ChargingType: station.ChargingType || ChargingType.AC,
      Type: station.Type || station.ChargingType || ChargingType.AC,
      TotalSlots: station.TotalSlots || 1,
      AvailableSlots: station.AvailableSlots || 1,
      Description: station.Description,
      Amenities: station.Amenities,
      PricePerHour: station.PricePerHour || 0,
      PowerOutput: station.PowerOutput,
      OperatorId: station.OperatorId,
      OperatingHours: station.OperatingHours,
      OperatingHoursDto: station.OperatingHoursDto,
      AssignedOperatorIds: station.AssignedOperatorIds || []
    };

    const response = await this.createStation(createRequest);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to create station');
  },

  async updateStationLegacy(id: string, station: Partial<ChargingStation>): Promise<ChargingStation> {
    // Convert legacy format to API format
    const updateRequest: UpdateChargingStationRequestDto = {
      Id: id,
      Name: station.Name || '',
      Location: station.Location || '',
      Latitude: station.Latitude || 0,
      Longitude: station.Longitude || 0,
      ChargingType: station.ChargingType || ChargingType.AC,
      Type: station.Type || station.ChargingType || ChargingType.AC,
      TotalSlots: station.TotalSlots || 1,
      AvailableSlots: station.AvailableSlots || 1,
      Description: station.Description,
      Amenities: station.Amenities,
      PricePerHour: station.PricePerHour || 0,
      PowerOutput: station.PowerOutput,
      OperatorId: station.OperatorId,
      OperatingHours: station.OperatingHours,
      OperatingHoursDto: station.OperatingHoursDto,
      AssignedOperatorIds: station.AssignedOperatorIds || [],
      Status: station.Status
    };

    const response = await this.updateStation(id, updateRequest);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to update station');
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
      const updateRequest: UpdateChargingStationRequestDto = {
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
