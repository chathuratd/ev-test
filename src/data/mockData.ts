import { User, ChargingStation, Booking, DashboardStats, RecentBooking, StationUtilization } from '../types';

// Demo credentials
export const DEMO_CREDENTIALS = {
  backoffice: {
    username: 'backoffice',
    password: 'password123',
    user: {
      id: '1',
      username: 'backoffice',
      name: 'Admin User',
      email: 'admin@evcharging.com',
      role: 'backoffice' as const,
      status: 'active' as const,
    }
  },
  operator: {
    username: 'operator',
    password: 'password123',
    user: {
      id: '2',
      username: 'operator',
      name: 'Station Operator',
      email: 'operator@evcharging.com',
      role: 'station_operator' as const,
      status: 'active' as const,
    }
  }
};

// Mock Users
export const MOCK_USERS: User[] = [
  DEMO_CREDENTIALS.backoffice.user,
  DEMO_CREDENTIALS.operator.user,
  {
    id: '3',
    username: 'operator2',
    name: 'Station Operator 2',
    email: 'operator2@evcharging.com',
    role: 'station_operator',
    status: 'active',
  },
  {
    id: '4',
    username: 'admin2',
    name: 'Admin User 2',
    email: 'admin2@evcharging.com',
    role: 'backoffice',
    status: 'inactive',
  }
];

// Mock Charging Stations
export const MOCK_STATIONS: ChargingStation[] = [
  {
    id: '1',
    name: 'Central Mall Charging Hub',
    location: 'Downtown',
    address: '123 Main Street, Downtown, City',
    latitude: 40.7128,
    longitude: -74.0060,
    description: 'Fast charging station at Central Mall with shopping amenities',
    chargingType: 'Both',
    totalSlots: 8,
    availableSlots: 3,
    powerCapacity: '150kW',
    pricePerHour: 25.00,
    operatingHours: {
      start: '06:00',
      end: '22:00'
    },
    amenities: ['WiFi', 'Restaurant', 'Shopping', 'Restrooms'],
    assignedOperators: ['2', '3'],
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-10-01T10:30:00Z'
  },
  {
    id: '2',
    name: 'Airport Express Station',
    location: 'Airport',
    address: '456 Airport Road, Terminal 1',
    latitude: 40.6413,
    longitude: -73.7781,
    description: 'Quick charging for travelers',
    chargingType: 'DC',
    totalSlots: 12,
    availableSlots: 8,
    powerCapacity: '200kW',
    pricePerHour: 30.00,
    operatingHours: {
      start: '24/7',
      end: '24/7'
    },
    amenities: ['WiFi', 'Coffee Shop', 'Waiting Area'],
    assignedOperators: ['2'],
    status: 'active',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-09-28T14:15:00Z'
  },
  {
    id: '3',
    name: 'Residential Complex Station',
    location: 'Suburb',
    address: '789 Residential Ave, Suburb',
    latitude: 40.7580,
    longitude: -73.9855,
    description: 'Overnight charging for residents',
    chargingType: 'AC',
    totalSlots: 6,
    availableSlots: 0,
    powerCapacity: '22kW',
    pricePerHour: 15.00,
    operatingHours: {
      start: '00:00',
      end: '23:59'
    },
    amenities: ['Security', 'Covered Parking'],
    assignedOperators: ['3'],
    status: 'maintenance',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-10-05T09:20:00Z'
  },
  {
    id: '4',
    name: 'Highway Rest Stop',
    location: 'Highway Mile 45',
    address: 'Highway 101, Mile 45 Rest Area',
    latitude: 40.8176,
    longitude: -74.0431,
    description: 'Fast charging for highway travelers',
    chargingType: 'Both',
    totalSlots: 10,
    availableSlots: 7,
    powerCapacity: '175kW',
    pricePerHour: 28.00,
    operatingHours: {
      start: '24/7',
      end: '24/7'
    },
    amenities: ['Restrooms', 'Vending Machines', 'Pet Area'],
    assignedOperators: ['2', '3'],
    status: 'active',
    createdAt: '2024-04-20T08:00:00Z',
    updatedAt: '2024-10-03T16:45:00Z'
  }
];

// Mock Bookings
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    evOwnerId: 'evo1',
    evOwnerName: 'John Smith',
    stationId: '1',
    stationName: 'Central Mall Charging Hub',
    stationLocation: 'Downtown',
    bookingDate: '2024-10-08',
    reservationDate: '2024-10-08',
    reservationTime: '14:30',
    status: 'approved',
    qrCode: 'QR001',
    createdAt: '2024-10-07T10:00:00Z',
    updatedAt: '2024-10-07T10:00:00Z'
  },
  {
    id: '2',
    evOwnerId: 'evo2',
    evOwnerName: 'Sarah Johnson',
    stationId: '2',
    stationName: 'Airport Express Station',
    stationLocation: 'Airport',
    bookingDate: '2024-10-08',
    reservationDate: '2024-10-09',
    reservationTime: '09:00',
    status: 'pending',
    createdAt: '2024-10-08T08:00:00Z',
    updatedAt: '2024-10-08T08:00:00Z'
  },
  {
    id: '3',
    evOwnerId: 'evo3',
    evOwnerName: 'Mike Davis',
    stationId: '4',
    stationName: 'Highway Rest Stop',
    stationLocation: 'Highway Mile 45',
    bookingDate: '2024-10-07',
    reservationDate: '2024-10-07',
    reservationTime: '16:00',
    status: 'completed',
    qrCode: 'QR003',
    createdAt: '2024-10-06T14:30:00Z',
    updatedAt: '2024-10-07T18:00:00Z'
  },
  {
    id: '4',
    evOwnerId: 'evo4',
    evOwnerName: 'Lisa Chen',
    stationId: '1',
    stationName: 'Central Mall Charging Hub',
    stationLocation: 'Downtown',
    bookingDate: '2024-10-06',
    reservationDate: '2024-10-06',
    reservationTime: '11:00',
    status: 'cancelled',
    createdAt: '2024-10-05T09:15:00Z',
    updatedAt: '2024-10-06T08:30:00Z'
  }
];

// Mock Dashboard Stats
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalBookings: 1248,
  bookingsChange: 12.5,
  activeStations: 3,
  stationsInMaintenance: 1,
  evOwners: 856,
  evOwnersChange: 8.2,
  revenue: 45250,
  revenueChange: 15.3
};

// Mock Recent Bookings
export const MOCK_RECENT_BOOKINGS: RecentBooking[] = [
  {
    customerName: 'John Smith',
    stationLocation: 'Central Mall Charging Hub',
    timeAgo: '2 minutes ago'
  },
  {
    customerName: 'Sarah Johnson',
    stationLocation: 'Airport Express Station',
    timeAgo: '15 minutes ago'
  },
  {
    customerName: 'Mike Davis',
    stationLocation: 'Highway Rest Stop',
    timeAgo: '1 hour ago'
  },
  {
    customerName: 'Lisa Chen',
    stationLocation: 'Central Mall Charging Hub',
    timeAgo: '2 hours ago'
  },
  {
    customerName: 'Tom Wilson',
    stationLocation: 'Airport Express Station',
    timeAgo: '3 hours ago'
  }
];

// Mock Station Utilization
export const MOCK_STATION_UTILIZATION: StationUtilization[] = [
  {
    stationName: 'Central Mall Charging Hub',
    utilizationPercentage: 75
  },
  {
    stationName: 'Airport Express Station',
    utilizationPercentage: 60
  },
  {
    stationName: 'Highway Rest Stop',
    utilizationPercentage: 85
  },
  {
    stationName: 'Residential Complex Station',
    utilizationPercentage: 45
  }
];