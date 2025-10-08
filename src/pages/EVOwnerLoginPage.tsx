import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, CreditCard, Lock, Eye, EyeOff } from 'lucide-react';
import { evOwnerService } from '../services/evOwnerService';
import { authService } from '../services/authService';
import { EVOwnerLoginRequestDto } from '../types';

const EVOwnerLoginPage = () => {
  const [formData, setFormData] = useState<EVOwnerLoginRequestDto>({
    NIC: '',
    Password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await evOwnerService.loginEVOwner(formData);
      if (response.Success && response.Data) {
        // Store the auth data
        authService.storeTokenData(response.Data);
        alert('Login successful! Welcome to EV Network.');
        // Redirect to a dashboard for EV owners (you might want to create this)
        navigate('/ev-owner-dashboard');
      } else {
        setError(response.Message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.Message) {
        setError(err.response.data.Message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">EV Network</h1>
          <p className="text-gray-400">Sign in to your EV Owner account</p>
        </div>

        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h2 className="text-xl font-semibold text-white mb-2">EV Owner Sign In</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your NIC and password to access your account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <CreditCard className="inline w-4 h-4 mr-2" />
                NIC Number
              </label>
              <input
                type="text"
                name="NIC"
                value={formData.NIC}
                onChange={handleChange}
                placeholder="Enter your NIC number"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/ev-owner-register" className="text-green-400 hover:text-green-300 font-medium">
                Register here
              </Link>
            </p>
            <p className="text-gray-400 text-sm">
              System Admin?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
                Admin Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVOwnerLoginPage;