export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'backoffice' | 'station_operator';
  status: 'active' | 'inactive';
}

export interface ChargingStation {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  chargingType: 'AC' | 'DC' | 'Both';
  totalSlots: number;
  availableSlots: number;
  powerCapacity: string;
  pricePerHour: number;
  operatingHours: {
    start: string;
    end: string;
  };
  amenities: string[];
  assignedOperators: string[];
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  evOwnerId: string;
  evOwnerName: string;
  stationId: string;
  stationName: string;
  stationLocation: string;
  bookingDate: string;
  reservationDate: string;
  reservationTime: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  bookingsChange: number;
  activeStations: number;
  stationsInMaintenance: number;
  evOwners: number;
  evOwnersChange: number;
  revenue: number;
  revenueChange: number;
}

export interface RecentBooking {
  customerName: string;
  stationLocation: string;
  timeAgo: string;
}

export interface StationUtilization {
  stationName: string;
  utilizationPercentage: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface DeactivateStationRequest {
  reason: string;
  deactivationDate: string;
}

export interface UpdateSlotsRequest {
  availableSlots: number;
  totalSlots: number;
}
