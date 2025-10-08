import { Booking } from '../types';
import { MOCK_BOOKINGS } from '../data/mockData';

// Create a mutable copy of bookings for in-memory operations
let bookings = [...MOCK_BOOKINGS];

export const bookingService = {
  async getAllBookings(): Promise<Booking[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...bookings];
  },

  async getBookingById(id: string): Promise<Booking> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return { ...booking };
  },

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      evOwnerId: bookingData.evOwnerId || '',
      evOwnerName: bookingData.evOwnerName || '',
      stationId: bookingData.stationId || '',
      stationName: bookingData.stationName || '',
      stationLocation: bookingData.stationLocation || '',
      bookingDate: bookingData.bookingDate || new Date().toISOString().split('T')[0],
      reservationDate: bookingData.reservationDate || new Date().toISOString().split('T')[0],
      reservationTime: bookingData.reservationTime || '09:00',
      status: bookingData.status || 'pending',
      qrCode: bookingData.qrCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    return { ...newBooking };
  },

  async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bookingIndex = bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      throw new Error('Booking not found');
    }

    const updatedBooking = {
      ...bookings[bookingIndex],
      ...bookingData,
      updatedAt: new Date().toISOString()
    };

    bookings[bookingIndex] = updatedBooking;
    return { ...updatedBooking };
  },

  async deleteBooking(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const bookingIndex = bookings.findIndex(b => b.id === id);
    if (bookingIndex === -1) {
      throw new Error('Booking not found');
    }

    bookings.splice(bookingIndex, 1);
  },

  async approveBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, { 
      status: 'approved',
      qrCode: `QR${Date.now()}`
    });
  },

  async cancelBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, { status: 'cancelled' });
  },

  async completeBooking(id: string): Promise<Booking> {
    return this.updateBooking(id, { status: 'completed' });
  },
};