import { NavLink, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, Users, Zap as StationIcon, Calendar, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const isStationOperator = user?.Role === UserRole.StationOperator;

  // Define all nav items with role-based access
  const allNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', allowedRoles: [UserRole.Backoffice] },
    { to: '/ev-owners', icon: Users, label: 'EV Owners', allowedRoles: [UserRole.Backoffice] },
    { to: '/stations', icon: StationIcon, label: 'Charging Stations', allowedRoles: [UserRole.Backoffice, UserRole.StationOperator] },
    { to: '/bookings', icon: Calendar, label: 'Bookings', allowedRoles: [UserRole.Backoffice, UserRole.StationOperator] },
    { to: '/users', icon: Shield, label: 'System Users', allowedRoles: [UserRole.Backoffice] },
  ];

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item =>
    item.allowedRoles.includes(user?.Role as UserRole)
  );

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-bold text-white">EV Station</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-black font-semibold text-sm">
              {user?.FullName?.charAt(0).toUpperCase() || user?.FirstName?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user?.FullName || `${user?.FirstName} ${user?.LastName}` || 'Admin User'}
            </p>
            <p className="text-gray-400 text-xs truncate capitalize">{user?.Role || 'Backoffice'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
