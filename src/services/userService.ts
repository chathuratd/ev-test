import apiClient from './api';
import { 
  User, 
  ApiResponse, 
  CreateUserRequestDto, 
  UpdateUserRequestDto,
  UserRole,
  AccountStatus
} from '../types';

export interface UserSearchFilters {
  Role?: UserRole;
  Status?: AccountStatus;
  SearchTerm?: string;
}

export const userService = {
  async getAllUsers(filters?: UserSearchFilters): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();
    
    if (filters?.Role) {
      params.append('Role', filters.Role);
    }
    if (filters?.Status) {
      params.append('Status', filters.Status);
    }
    if (filters?.SearchTerm) {
      params.append('SearchTerm', filters.SearchTerm);
    }

    const response = await apiClient.get<ApiResponse<User[]>>(`/Users?${params.toString()}`);
    return response.data;
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/Users/${id}`);
    return response.data;
  },

  async createUser(user: CreateUserRequestDto): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/Users', user);
    return response.data;
  },

  async updateUser(id: string, user: UpdateUserRequestDto): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/Users/${id}`, user);
    return response.data;
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/Users/${id}`);
    return response.data;
  },

  async assignStations(userId: string, stationIds: string[]): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`/Users/${userId}/assign-stations`, stationIds);
    return response.data;
  },

  // Legacy methods for backward compatibility
  async getAllUsersLegacy(): Promise<User[]> {
    const response = await this.getAllUsers();
    return response.Success && response.Data ? response.Data : [];
  },

  async getUserByIdLegacy(id: string): Promise<User> {
    const response = await this.getUserById(id);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'User not found');
  },

  async createUserLegacy(user: Partial<User>): Promise<User> {
    const createRequest: CreateUserRequestDto = {
      Username: user.Username || '',
      Email: user.Email || '',
      Password: 'TempPassword123!', // This should be provided by the form
      FirstName: user.FirstName || '',
      LastName: user.LastName || '',
      Role: user.Role || UserRole.StationOperator,
      AssignedStationIds: user.AssignedStationIds || []
    };

    const response = await this.createUser(createRequest);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to create user');
  },

  async updateUserLegacy(id: string, user: Partial<User>): Promise<User> {
    const updateRequest: UpdateUserRequestDto = {
      Email: user.Email,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Role: user.Role,
      Status: user.Status,
      AssignedStationIds: user.AssignedStationIds
    };

    const response = await this.updateUser(id, updateRequest);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Message || 'Failed to update user');
  },

  async deleteUserLegacy(id: string): Promise<void> {
    const response = await this.deleteUser(id);
    if (!response.Success) {
      throw new Error(response.Message || 'Failed to delete user');
    }
  },
};
