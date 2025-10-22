import apiClient from './api';
import { 
  EVOwner, 
  ApiResponse, 
  RegisterEVOwnerRequestDto, 
  EVOwnerLoginRequestDto,
  AuthData,
  CreateBookingRequestDto,
  Booking,
  ChargingStation
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

  // Legacy methods for backward compatibility
  async getAllEVOwnersLegacy(): Promise<EVOwner[]> {
    // Since there's no "get all EV owners" endpoint in the swagger, 
    // this method is not supported. Return empty array.
    console.warn('getAllEVOwnersLegacy: No API endpoint available for getting all EV owners');
    return [];
  },

  async getEVOwnerByNicLegacy(_nic: string): Promise<EVOwner | null> {
    // Since there's no "get EV owner by NIC" endpoint in the swagger,
    // we'll return null. You might need to implement this based on
    // your specific requirements
    return null;
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

  // Bookings Management
  async createBooking(bookingData: CreateBookingRequestDto): Promise<ApiResponse<Booking>> {
    try {
      const response = await apiClient.post<ApiResponse<Booking>>('/Bookings', bookingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.Message || 'Failed to create booking');
    }
  },

  async getUserBookings(nic: string): Promise<Booking[]> {
    try {
      const response = await apiClient.get<ApiResponse<Booking[]>>(`/api/v1/Booking/evowner/${nic}`);
      if (response.data.Success && response.data.Data) {
        return response.data.Data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch user bookings:', error);
      throw new Error(error.response?.data?.Message || 'Failed to fetch user bookings');
    }
  },

  async cancelBooking(bookingId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`/Bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.Message || 'Failed to cancel booking');
    }
  },

  // Dashboard Statistics
  // THIN CLIENT: Get dashboard stats calculated by backend
  async getDashboardStats(nic: string): Promise<ApiResponse<any>> {
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