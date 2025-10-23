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
  ChargingType,
  ChargingStationSearchParams,
  ChargingStationNearbyParams
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

  async searchStations(params: ChargingStationSearchParams): Promise<ApiResponse<ChargingStation[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.location) queryParams.append('location', params.location);
    if (params.type) queryParams.append('type', params.type);
    if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) queryParams.append('longitude', params.longitude.toString());
    if (params.radiusKm !== undefined) queryParams.append('radiusKm', params.radiusKm.toString());
    if (params.availableOnly !== undefined) queryParams.append('availableOnly', params.availableOnly.toString());
    if (params.maxPricePerHour !== undefined) queryParams.append('maxPricePerHour', params.maxPricePerHour.toString());
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());

    const response = await apiClient.get<ApiResponse<ChargingStation[]>>(`/ChargingStation/search?${queryParams.toString()}`);
    return response.data;
  },

  async getNearbyStations(params: ChargingStationNearbyParams): Promise<ApiResponse<ChargingStation[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) queryParams.append('longitude', params.longitude.toString());
    if (params.radiusKm !== undefined) queryParams.append('radiusKm', params.radiusKm.toString());
    if (params.availableOnly !== undefined) queryParams.append('availableOnly', params.availableOnly.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<ApiResponse<ChargingStation[]>>(`/ChargingStation/nearby?${queryParams.toString()}`);
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

  async searchStationsLegacy(params: ChargingStationSearchParams): Promise<ChargingStation[]> {
    const response = await this.searchStations(params);
    return response.Success && response.Data ? response.Data : [];
  },

  async getNearbyStationsLegacy(params: ChargingStationNearbyParams): Promise<ChargingStation[]> {
    const response = await this.getNearbyStations(params);
    return response.Success && response.Data ? response.Data : [];
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
    // First check if station is inactive
    const stationResponse = await this.getStationById(id);
    if (stationResponse.Success && stationResponse.Data) {
      const currentStatus = stationResponse.Data.Status?.toLowerCase();

      // Only allow activation if station is inactive
      if (currentStatus === 'active') {
        throw new Error('Station is already active');
      }

      // Use update station endpoint to change status to Active
      const updateRequest: UpdateChargingStationRequestDto = {
        Id: stationResponse.Data.Id,
        Name: stationResponse.Data.Name,
        Location: stationResponse.Data.Location,
        Latitude: stationResponse.Data.Latitude,
        Longitude: stationResponse.Data.Longitude,
        Type: stationResponse.Data.Type,
        TotalSlots: stationResponse.Data.TotalSlots,
        AvailableSlots: stationResponse.Data.AvailableSlots,
        Description: stationResponse.Data.Description,
        Amenities: stationResponse.Data.Amenities,
        PricePerHour: stationResponse.Data.PricePerHour,
        PowerOutput: stationResponse.Data.PowerOutput,
        OperatorId: stationResponse.Data.OperatorId,
        OperatingHoursDto: stationResponse.Data.OperatingHoursDto,
        AssignedOperatorIds: stationResponse.Data.AssignedOperatorIds,
        Status: 'Active'
      };

      const response = await this.updateStation(id, updateRequest);
      if (!response.Success) {
        throw new Error(response.Message || 'Failed to activate station');
      }
    } else {
      throw new Error('Station not found');
    }
  },
};
