import { NavLink, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, Car, Calendar, MapPin, User, LogOut } from 'lucide-react';

const EVOwnerSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear EV Owner session data
    localStorage.removeItem('userNic');
    localStorage.removeItem('evOwnerNic');
    localStorage.removeItem('evOwnerName');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login
    navigate('/ev-owner-login');
  };

  const getUserInfo = () => {
    const userName = localStorage.getItem('evOwnerName');
    const userNic = localStorage.getItem('userNic') || localStorage.getItem('evOwnerNic');
    
    return {
      name: userName || 'EV Owner',
      nic: userNic || 'Unknown'
    };
  };

  const userInfo = getUserInfo();

  const navItems = [
    { to: '/ev-owner-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ev-owner/stations', icon: MapPin, label: 'Find Stations' },
    { to: '/ev-owner/bookings', icon: Calendar, label: 'My Bookings' },
    { to: '/ev-owner/book-station', icon: Car, label: 'Book Station' },
  ];

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <span className="text-xl font-bold text-white">EV Network</span>
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
        <div className="flex items-center gap-3 mb-4 px-4 py-3">
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-300" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">{userInfo.name}</p>
            <p className="text-gray-400 text-xs">NIC: {userInfo.nic}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default EVOwnerSidebar;