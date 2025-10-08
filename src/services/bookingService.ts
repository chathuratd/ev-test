import apiClient from './api';
import { 
  Booking, 
  ApiResponse, 
  CreateBookingRequestDto, 
  UpdateBookingRequestDto,
  CancelBookingRequestDto,
  ConfirmBookingRequestDto,
  CompleteBookingRequestDto
} from '../types';

export const bookingService = {
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

  // Convenience methods that return data directly
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

  // Legacy methods for backward compatibility
  async getAllBookingsLegacy(): Promise<Booking[]> {
    // Since there's no "get all bookings" endpoint, we'll return mock data
    // In a real implementation, you might need to aggregate from multiple sources
    return [];
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