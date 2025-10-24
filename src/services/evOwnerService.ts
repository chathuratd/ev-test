import apiClient from './api';
import { 
  EVOwner, 
  ApiResponse, 
  RegisterEVOwnerRequestDto, 
  EVOwnerLoginRequestDto,
  UpdateEVOwnerRequestDto,
  AuthData,
  CreateBookingRequestDto,
  Booking,
  EVOwnerQueryParams
} from '../types';

export const evOwnerService = {
  async registerEVOwner(registration: RegisterEVOwnerRequestDto): Promise<ApiResponse<EVOwner>> {
    const response = await apiClient.post<ApiResponse<EVOwner>>('/EVOwners/register', registration);
    return response.data;
  },

  async loginEVOwner(credentials: EVOwnerLoginRequestDto): Promise<ApiResponse<AuthData>> {
    const response = await apiClient.post<ApiResponse<AuthData>>('/EVOwners/login', credentials);
    return response.data;
  },

  async getAllEVOwners(params?: EVOwnerQueryParams): Promise<ApiResponse<EVOwner[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);

    const response = await apiClient.get<ApiResponse<EVOwner[]>>(`/EVOwners?${queryParams.toString()}`);
    return response.data;
  },

  // New test endpoint for development/debugging
  async getAllEVOwnersTest(params?: EVOwnerQueryParams): Promise<ApiResponse<EVOwner[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);

    const response = await apiClient.get<ApiResponse<EVOwner[]>>(`/EVOwners/test?${queryParams.toString()}`);
    return response.data;
  },

  async getCurrentEVOwner(): Promise<ApiResponse<EVOwner>> {
    const response = await apiClient.get<ApiResponse<EVOwner>>('/EVOwners/me');
    return response.data;
  },

  async updateCurrentEVOwner(updateData: UpdateEVOwnerRequestDto): Promise<ApiResponse<EVOwner>> {
    const response = await apiClient.put<ApiResponse<EVOwner>>('/EVOwners/me', updateData);
    return response.data;
  },

  async getEVOwnerByNic(nic: string): Promise<ApiResponse<EVOwner>> {
    const response = await apiClient.get<ApiResponse<EVOwner>>(`/EVOwners/${nic}`);
    return response.data;
  },

  async updateEVOwner(nic: string, updateData: UpdateEVOwnerRequestDto): Promise<ApiResponse<EVOwner>> {
    const response = await apiClient.put<ApiResponse<EVOwner>>(`/EVOwners/${nic}`, updateData);
    return response.data;
  },

  async deleteEVOwner(nic: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/EVOwners/${nic}`);
    return response.data;
  },

  async activateEVOwner(nic: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`/EVOwners/${nic}/activate`);
    return response.data;
  },

  // Convenience methods that return data directly
  async registerEVOwnerDirect(registration: RegisterEVOwnerRequestDto): Promise<EVOwner> {
    const response = await this.registerEVOwner(registration);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to register EV owner');
  },

  async loginEVOwnerDirect(credentials: EVOwnerLoginRequestDto): Promise<AuthData> {
    const response = await this.loginEVOwner(credentials);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'EV owner login failed');
  },

  async getAllEVOwnersLegacy(): Promise<EVOwner[]> {
    const response = await this.getAllEVOwners();
    return response.Success && response.Data ? response.Data : [];
  },

  // Test endpoint legacy method
  async getAllEVOwnersTestLegacy(): Promise<EVOwner[]> {
    const response = await this.getAllEVOwnersTest();
    return response.Success && response.Data ? response.Data : [];
  },

  // Development helper method to try test endpoint first, then fallback to production
  async getAllEVOwnersWithFallback(): Promise<EVOwner[]> {
    try {
      // Try test endpoint first (useful for development)
      return await this.getAllEVOwnersTestLegacy();
    } catch (error) {
      console.warn('Test EV owners endpoint failed, trying production:', error);
      return await this.getAllEVOwnersLegacy();
    }
  },

  async getEVOwnerByNicLegacy(nic: string): Promise<EVOwner | null> {
    try {
      const response = await this.getEVOwnerByNic(nic);
      return response.Success && response.Data ? response.Data : null;
    } catch (error) {
      console.warn(`Failed to fetch EV owner with NIC ${nic}:`, error);
      return null;
    }
  },

  async getCurrentEVOwnerLegacy(): Promise<EVOwner | null> {
    try {
      const response = await this.getCurrentEVOwner();
      return response.Success && response.Data ? response.Data : null;
    } catch (error) {
      console.warn('Failed to fetch current EV owner:', error);
      return null;
    }
  },

  async registerEVOwnerLegacy(registration: any): Promise<EVOwner> {
    const registerRequest: RegisterEVOwnerRequestDto = {
      NIC: registration.nic || registration.NIC,
      FirstName: registration.firstName || registration.FirstName,
      LastName: registration.lastName || registration.LastName,
      Email: registration.email || registration.Email,
      PhoneNumber: registration.phoneNumber || registration.PhoneNumber,
      Password: registration.password || registration.Password,
      ConfirmPassword: registration.confirmPassword || registration.ConfirmPassword || registration.password || registration.Password
    };

    return await this.registerEVOwnerDirect(registerRequest);
  },

  async loginEVOwnerLegacy(nic: string, password: string): Promise<AuthData> {
    const loginRequest: EVOwnerLoginRequestDto = {
      NIC: nic,
      Password: password
    };

    return await this.loginEVOwnerDirect(loginRequest);
  },

  // Bookings Management (using the existing booking service endpoints)
  async createBooking(bookingData: CreateBookingRequestDto): Promise<ApiResponse<Booking>> {
    try {
      const response = await apiClient.post<ApiResponse<Booking>>('/Booking', bookingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.Message || 'Failed to create booking');
    }
  },

  async getUserBookings(nic: string): Promise<Booking[]> {
    try {
      const response = await apiClient.get<ApiResponse<Booking[]>>(`/Booking/evowner/${nic}`);
      if (response.data.Success && response.data.Data) {
        return response.data.Data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch user bookings:', error);
      throw new Error(error.response?.data?.Message || 'Failed to fetch user bookings');
    }
  },

  async cancelBooking(bookingId: string, reason: string = 'Cancelled by user'): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<ApiResponse<any>>('/Booking/cancel', {
        BookingId: bookingId,
        CancellationReason: reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.Message || 'Failed to cancel booking');
    }
  },

  // Dashboard Statistics - calculated from real user data
  async getDashboardStats(nic: string): Promise<any> {
    try {
      // Backend calculates all statistics
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/v1/EVOwners/${nic}/dashboard-stats`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      throw new Error(error.response?.data?.Message || 'Failed to fetch dashboard stats');
    }
  }
};