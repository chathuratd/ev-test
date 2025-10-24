import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { userService } from '../services/userService';
import { User, UserRole, AccountStatus, CreateUserRequestDto, UpdateUserRequestDto } from '../types';
import AddUserModal from '../components/users/AddUserModal';
import EditUserModal from '../components/users/EditUserModal';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.Username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.Email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      if (response.Success && response.Data) {
        setUsers(response.Data);
        setFilteredUsers(response.Data);
      } else {
        console.error('Failed to fetch users:', response.Message);
        setMockData();
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const mockData: User[] = [
      {
        Id: '1',
        Username: 'admin',
        FirstName: 'System',
        LastName: 'Administrator',
        FullName: 'System Administrator',
        Email: 'admin@evstation.com',
        Role: UserRole.Backoffice,
        Status: AccountStatus.Active,
        AssignedStationIds: [],
        LastLoginAt: new Date().toISOString(),
      },
      {
        Id: '2',
        Username: 'operator1',
        FirstName: 'John',
        LastName: 'Operator',
        FullName: 'John Operator',
        Email: 'john@evstation.com',
        Role: UserRole.StationOperator,
        Status: AccountStatus.Active,
        AssignedStationIds: [],
        LastLoginAt: new Date().toISOString(),
      },
    ];
    setUsers(mockData);
    setFilteredUsers(mockData);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userService.deleteUser(id);
        if (response.Success) {
          fetchUsers();
        } else {
          console.error('Failed to delete user:', response.Message);
          alert('Failed to delete user: ' + response.Message);
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleEditUser = async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: AccountStatus;
    assignedStationIds: string[];
  }) => {
    if (!selectedUser) return;

    try {
      const updateRequest: UpdateUserRequestDto = {
        Email: userData.email,
        FirstName: userData.firstName,
        LastName: userData.lastName,
        Role: userData.role,
        Status: userData.status,
        AssignedStationIds: userData.assignedStationIds
      };

      const response = await userService.updateUser(selectedUser.Id, updateRequest);
      if (response.Success) {
        fetchUsers(); // Refresh the user list
        setSelectedUser(null);
      } else {
        // Backend validation error from API response
        throw new Error(response.Message || 'Failed to update user');
      }
    } catch (error: any) {
      // Extract error message from backend
      if (error.response?.data?.Message) {
        throw new Error(error.response.data.Message);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to update user. Please try again.');
      }
    }
  };

  const handleAddUser = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    assignedStationIds: string[];
  }) => {
    try {
      const createRequest: CreateUserRequestDto = {
        Username: userData.username,
        Email: userData.email,
        Password: userData.password,
        FirstName: userData.firstName,
        LastName: userData.lastName,
        Role: userData.role,
        AssignedStationIds: userData.assignedStationIds
      };

      const response = await userService.createUser(createRequest);
      if (response.Success) {
        fetchUsers(); // Refresh the user list
      } else {
        // Backend validation error from API response
        throw new Error(response.Message || 'Failed to create user');
      }
    } catch (error: any) {
      // Extract error message from backend
      if (error.response?.data?.Message) {
        // API returned an error with Message field
        throw new Error(error.response.data.Message);
      } else if (error.response?.data?.message) {
        // API returned an error with lowercase message field
        throw new Error(error.response.data.message);
      } else if (error.message) {
        // Error already has a message
        throw error;
      } else {
        // Generic error
        throw new Error('Failed to create user. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Users</h1>
        <p className="text-gray-400">Manage Backoffice and Station Operator accounts</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors ml-4"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Username</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Role</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Assigned Stations</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.Id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="py-4 px-4">
                    <p className="text-white font-medium">{user.Username}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{user.FullName}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{user.Email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-gray-300">
                      {user.Role === UserRole.Backoffice ? 'Backoffice' : 'Station Operator'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {user.Role === UserRole.StationOperator ? (
                      <span className="text-white">
                        {user.AssignedStationIds?.length || 0} station{user.AssignedStationIds?.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        user.Status === AccountStatus.Active
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {user.Status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                        className="text-white hover:text-green-400 font-medium text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.Id)}
                        className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUser}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersPage;
