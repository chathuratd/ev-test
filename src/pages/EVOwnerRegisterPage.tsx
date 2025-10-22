import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, User, Mail, Phone, CreditCard, Lock, Eye, EyeOff } from 'lucide-react';
import { evOwnerService } from '../services/evOwnerService';
import { RegisterEVOwnerRequestDto } from '../types';

const EVOwnerRegisterPage = () => {
  const [formData, setFormData] = useState<RegisterEVOwnerRequestDto>({
    NIC: '',
    FirstName: '',
    LastName: '',
    Email: '',
    PhoneNumber: '',
    Password: '',
    ConfirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // THIN CLIENT: All validation is handled by the backend
  // No client-side validation - we only clear errors when user types
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // THIN CLIENT: Send data directly to backend, let backend validate
      const response = await evOwnerService.registerEVOwner(formData);
      
      if (response.Success) {
        alert('Registration successful! You can now login.');
        navigate('/ev-owner-login');
      } else {
        // Handle backend validation errors
        if (response.Errors) {
          setErrors(response.Errors);
        } else {
          setErrors({ general: response.Message || 'Registration failed' });
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle backend errors
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Backend returns structured validation errors
        if (errorData.Errors) {
          setErrors(errorData.Errors);
        }
        // Handle .NET validation errors format
        else if (errorData.errors) {
          const backendErrors = errorData.errors;
          const newErrors: Record<string, string> = {};
          
          Object.keys(backendErrors).forEach(key => {
            const errorMessages = backendErrors[key];
            if (Array.isArray(errorMessages) && errorMessages.length > 0) {
              newErrors[key] = errorMessages[0];
            } else if (typeof errorMessages === 'string') {
              newErrors[key] = errorMessages;
            }
          });
          
          setErrors(newErrors);
        }
        // Single message errors
        else if (errorData.Message || errorData.message) {
          const message = errorData.Message || errorData.message;
          // Try to map message to specific field if possible
          if (message.toLowerCase().includes('nic')) {
            setErrors({ NIC: message });
          } else if (message.toLowerCase().includes('email')) {
            setErrors({ Email: message });
          } else {
            setErrors({ general: message });
          }
        }
        else {
          setErrors({ general: 'Registration failed. Please try again.' });
        }
      } else if (err.message) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
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
          <h1 className="text-3xl font-bold text-white mb-2">Join EV Network</h1>
          <p className="text-gray-400">Create your EV Owner account to start booking charging sessions</p>
        </div>

        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h2 className="text-xl font-semibold text-white mb-2">Register as EV Owner</h2>
          <p className="text-gray-400 text-sm mb-6">Fill in your details to create your account</p>

          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
              {errors.general}
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
                placeholder="123456789V or 200012345678"
                className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                  errors.NIC 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-zinc-700 focus:border-green-500 focus:ring-green-500'
                }`}
                required
              />
              {errors.NIC && (
                <p className="mt-1 text-sm text-red-400">{errors.NIC}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Old format: 9 digits + V/X (e.g., 123456789V) or New format: 12 digits (e.g., 200012345678)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  First Name
                </label>
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  placeholder="First name"
                  maxLength={50}
                  className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                    errors.FirstName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-zinc-700 focus:border-green-500 focus:ring-green-500'
                  }`}
                  required
                />
                {errors.FirstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.FirstName}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  maxLength={50}
                  className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                    errors.LastName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-zinc-700 focus:border-green-500 focus:ring-green-500'
                  }`}
                  required
                />
                {errors.LastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.LastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                  errors.Email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-zinc-700 focus:border-green-500 focus:ring-green-500'
                }`}
                required
              />
              {errors.Email && (
                <p className="mt-1 text-sm text-red-400">{errors.Email}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <Phone className="inline w-4 h-4 mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleChange}
                placeholder="0771234567"
                maxLength={10}
                className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                  errors.PhoneNumber 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-zinc-700 focus:border-green-500 focus:ring-green-500'
                }`}
                required
              />
              {errors.PhoneNumber && (
                <p className="mt-1 text-sm text-red-400">{errors.PhoneNumber}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Enter 10 digit phone number (without +94)</p>
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
                  placeholder="Create a strong password"
                  className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                    errors.Password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-zinc-700 focus:border-green-500 focus:ring-green-500'
                  }`}
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
              {errors.Password && (
                <p className="mt-1 text-sm text-red-400">{errors.Password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="ConfirmPassword"
                  value={formData.ConfirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-1 ${
                    errors.ConfirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-zinc-700 focus:border-green-500 focus:ring-green-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.ConfirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.ConfirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/ev-owner-login" className="text-green-400 hover:text-green-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVOwnerRegisterPage;