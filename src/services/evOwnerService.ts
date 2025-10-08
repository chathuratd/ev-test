import apiClient from './api';
import { 
  EVOwner, 
  ApiResponse, 
  RegisterEVOwnerRequestDto, 
  EVOwnerLoginRequestDto,
  AuthData
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
    // we'll return mock data for demonstration
    const mockData: EVOwner[] = [
      {
        NIC: '123456789V',
        FirstName: 'John',
        LastName: 'Doe',
        Email: 'john.doe@email.com',
        PhoneNumber: '+94771234567',
        FullName: 'John Doe',
        CreatedAt: '2025-10-01T10:00:00Z',
      },
      {
        NIC: '987654321V',
        FirstName: 'Jane',
        LastName: 'Smith',
        Email: 'jane.smith@email.com',
        PhoneNumber: '+94779876543',
        FullName: 'Jane Smith',
        CreatedAt: '2025-10-02T14:30:00Z',
      },
      {
        NIC: '456789123V',
        FirstName: 'Michael',
        LastName: 'Johnson',
        Email: 'michael.johnson@email.com',
        PhoneNumber: '+94774567891',
        FullName: 'Michael Johnson',
        CreatedAt: '2025-10-03T09:15:00Z',
      },
    ];
    return mockData;
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
  }
};