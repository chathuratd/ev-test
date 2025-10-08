// Base API Response Structure
export interface ApiResponse<T = any> {
  Success: boolean;
  Message: string;
  Data: T;
}

// Authentication Types
export interface User {
  Id: string;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  FullName: string;
  Role: UserRole;
  Status: AccountStatus;
  AssignedStationIds: string[];
  LastLoginAt: string;
}

export interface AuthData {
  AccessToken: string;
  RefreshToken: string;
  AccessTokenExpiry: string;
  RefreshTokenExpiry: string;
  User: User;
}

export interface LoginRequestDto {
  Username: string;
  Password: string;
}

export interface RefreshTokenRequestDto {
  RefreshToken: string;
}

// User Management Types
export enum UserRole {
  Backoffice = 'Backoffice',
  StationOperator = 'StationOperator'
}

export enum AccountStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended'
}

export interface CreateUserRequestDto {
  Username: string;
  Email: string;
  Password: string;
  FirstName: string;
  LastName: string;
  Role: UserRole;
  AssignedStationIds?: string[];
}

export interface UpdateUserRequestDto {
  Email?: string;
  FirstName?: string;
  LastName?: string;
  Role?: UserRole;
  Status?: AccountStatus;
  AssignedStationIds?: string[];
}

// Charging Station Types
export enum ChargingType {
  AC = 'AC',
  DC = 'DC'
}

export enum DayOfWeek {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday'
}

export interface OperatingHoursDto {
  OpenTime: string;
  CloseTime: string;
  Is24Hours?: boolean;
  ClosedDays?: DayOfWeek[];
}

export interface ChargingStation {
  Id: string;
  Name: string;
  Location: string;
  Latitude: number;
  Longitude: number;
  ChargingType: ChargingType;
  Type: ChargingType;
  TotalSlots: number;
  AvailableSlots: number;
  Description?: string;
  Amenities?: string[];
  PricePerHour: number;
  PowerOutput?: number;
  OperatorId?: string;
  OperatingHours?: OperatingHoursDto;
  OperatingHoursDto?: OperatingHoursDto;
  AssignedOperatorIds?: string[];
  Status?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CreateChargingStationRequestDto {
  Name: string;
  Location: string;
  Latitude: number;
  Longitude: number;
  ChargingType?: ChargingType;
  Type: ChargingType;
  TotalSlots: number;
  AvailableSlots: number;
  Description?: string;
  Amenities?: string[];
  PricePerHour: number;
  PowerOutput?: number;
  OperatorId?: string;
  OperatingHours?: string;
  OperatingHoursStart?: string;
  OperatingHoursEnd?: string;
  OperatingHoursDto?: OperatingHoursDto;
  AssignedOperatorIds?: string[];
}

export interface UpdateChargingStationRequestDto extends CreateChargingStationRequestDto {
  Id: string;
  Status?: string;
}

export interface DeactivateChargingStationRequestDto {
  Reason: string;
  DeactivatedBy: string;
  EstimatedReactivationDate?: string;
}

export interface UpdateSlotAvailabilityRequestDto {
  StationId: string;
  AvailableSlots: number;
  TotalSlots: number;
}

// Booking Types
export interface Booking {
  Id: string;
  EvOwnerNic: string;
  EvOwnerName?: string;
  ChargingStationId: string;
  StationName?: string;
  StationLocation?: string;
  SlotNumber: number;
  ReservationDateTime: string;
  Status: BookingStatus;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface CreateBookingRequestDto {
  EvOwnerNic: string;
  ChargingStationId: string;
  SlotNumber: number;
  ReservationDateTime: string;
}

export interface UpdateBookingRequestDto {
  BookingId: string;
  NewReservationDateTime: string;
}

export interface CancelBookingRequestDto {
  BookingId: string;
  CancellationReason: string;
}

export interface ConfirmBookingRequestDto {
  BookingId: string;
}

export interface CompleteBookingRequestDto {
  BookingId: string;
}

// EV Owner Types
export interface EVOwner {
  NIC: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  FullName?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface RegisterEVOwnerRequestDto {
  NIC: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  Password: string;
  ConfirmPassword: string;
}

export interface EVOwnerLoginRequestDto {
  NIC: string;
  Password: string;
}

// Dashboard Types
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

// Legacy Types for backward compatibility
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
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
