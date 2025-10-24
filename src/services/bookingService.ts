import apiClient from './api';
import { 
  Booking, 
  ApiResponse, 
  CreateBookingRequestDto, 
  UpdateBookingRequestDto,
  CancelBookingRequestDto,
  ConfirmBookingRequestDto,
  CompleteBookingRequestDto,
  BookingQueryParams
} from '../types';

export const bookingService = {
  async getAllBookings(params?: BookingQueryParams): Promise<ApiResponse<Booking[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.evOwnerNic) queryParams.append('evOwnerNic', params.evOwnerNic);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const response = await apiClient.get<ApiResponse<Booking[]>>(`/Booking?${queryParams.toString()}`);
    return response.data;
  },

  async createBooking(booking: CreateBookingRequestDto): Promise<ApiResponse<Booking>> {
    const response = await apiClient.post<ApiResponse<Booking>>('/Booking', booking);
    return response.data;
  },

  async getBookingById(bookingId: string): Promise<ApiResponse<Booking>> {
    const response = await apiClient.get<ApiResponse<Booking>>(`/Booking/${bookingId}`);
    return response.data;
  },

  async getBookingsByEvOwner(evOwnerNic: string): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/Booking/evowner/${evOwnerNic}`);
    return response.data;
  },

  async getBookingsByUser(userId: string): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/Booking/user/${userId}`);
    return response.data;
  },

  async updateBooking(request: UpdateBookingRequestDto): Promise<ApiResponse<Booking>> {
    const response = await apiClient.put<ApiResponse<Booking>>('/Booking/update', request);
    return response.data;
  },

  async cancelBooking(request: CancelBookingRequestDto): Promise<ApiResponse<void>> {
    const response = await apiClient.put<ApiResponse<void>>('/Booking/cancel', request);
    return response.data;
  },

  async confirmBooking(request: ConfirmBookingRequestDto): Promise<ApiResponse<void>> {
    const response = await apiClient.put<ApiResponse<void>>('/Booking/confirm', request);
    return response.data;
  },

  async completeBooking(request: CompleteBookingRequestDto): Promise<ApiResponse<void>> {
    const response = await apiClient.put<ApiResponse<void>>('/Booking/complete', request);
    return response.data;
  },

  // New dashboard endpoints
  async getBookingCounts(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>('/Booking/counts');
    return response.data;
  },

  async getUpcomingBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/Booking/upcoming');
    return response.data;
  },

  async getCompletedBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/Booking/completed');
    return response.data;
  },

  async getCancelledBookings(): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/Booking/cancelled');
    return response.data;
  },

  async getBookingsByOperator(operatorId: string): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get<ApiResponse<Booking[]>>(`/Booking/operator/${operatorId}`);
    return response.data;
  },

  // Legacy methods for backward compatibility
  async getAllBookingsLegacy(): Promise<Booking[]> {
    const response = await this.getAllBookings();
    return response.Success && response.Data ? response.Data : [];
  },

  async createBookingDirect(booking: CreateBookingRequestDto): Promise<Booking> {
    const response = await this.createBooking(booking);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to create booking');
  },

  async getBookingByIdDirect(bookingId: string): Promise<Booking> {
    const response = await this.getBookingById(bookingId);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Booking not found');
  },

  async getBookingsByEvOwnerDirect(evOwnerNic: string): Promise<Booking[]> {
    const response = await this.getBookingsByEvOwner(evOwnerNic);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch bookings');
  },

  async getBookingsByUserDirect(userId: string): Promise<Booking[]> {
    const response = await this.getBookingsByUser(userId);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch user bookings');
  },

  // Direct methods for new dashboard endpoints
  async getBookingCountsDirect(): Promise<any> {
    const response = await this.getBookingCounts();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch booking counts');
  },

  async getUpcomingBookingsDirect(): Promise<Booking[]> {
    const response = await this.getUpcomingBookings();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch upcoming bookings');
  },

  async getCompletedBookingsDirect(): Promise<Booking[]> {
    const response = await this.getCompletedBookings();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch completed bookings');
  },

  async getCancelledBookingsDirect(): Promise<Booking[]> {
    const response = await this.getCancelledBookings();
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to fetch cancelled bookings');
  },

  async updateBookingLegacy(bookingId: string, newDateTime: string): Promise<Booking> {
    const updateRequest: UpdateBookingRequestDto = {
      BookingId: bookingId,
      NewReservationDateTime: newDateTime
    };

    const response = await this.updateBooking(updateRequest);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to update booking');
  },

  async cancelBookingLegacy(bookingId: string, reason: string): Promise<void> {
    const cancelRequest: CancelBookingRequestDto = {
      BookingId: bookingId,
      CancellationReason: reason
    };

    const response = await this.cancelBooking(cancelRequest);
    if (!response.Success) {
      throw new Error(response.Message || 'Failed to cancel booking');
    }
  },

  async confirmBookingLegacy(bookingId: string): Promise<void> {
    const confirmRequest: ConfirmBookingRequestDto = {
      BookingId: bookingId
    };

    const response = await this.confirmBooking(confirmRequest);
    if (!response.Success) {
      throw new Error(response.Message || 'Failed to confirm booking');
    }
  },

  async completeBookingLegacy(bookingId: string): Promise<void> {
    const completeRequest: CompleteBookingRequestDto = {
      BookingId: bookingId
    };

    const response = await this.completeBooking(completeRequest);
    if (!response.Success) {
      throw new Error(response.Message || 'Failed to complete booking');
    }
  }
};