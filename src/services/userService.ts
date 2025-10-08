import { User } from '../types';
import { MOCK_USERS } from '../data/mockData';

// Create a mutable copy of users for in-memory operations
let users = [...MOCK_USERS];

export const userService = {
  async getAllUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...users];
  },

  async getUserById(id: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return { ...user };
  },

  async createUser(userData: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: userData.username || '',
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'station_operator',
      status: userData.status || 'active'
    };

    users.push(newUser);
    return { ...newUser };
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...users[userIndex],
      ...userData
    };

    users[userIndex] = updatedUser;
    return { ...updatedUser };
  },

  async deleteUser(id: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users.splice(userIndex, 1);
  },
};
