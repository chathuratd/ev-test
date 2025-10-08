import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, LayoutDashboard, Users, Zap as StationIcon, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ev-owners', icon: Users, label: 'EV Owners' },
    { to: '/stations', icon: StationIcon, label: 'Charging Stations' },
    { to: '/bookings', icon: Calendar, label: 'Bookings' },
    { to: '/users', icon: Shield, label: 'System Users' },
  ];

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-black font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{user?.name || 'Admin User'}</p>
            <p className="text-gray-400 text-xs truncate capitalize">{user?.role || 'Backoffice'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
