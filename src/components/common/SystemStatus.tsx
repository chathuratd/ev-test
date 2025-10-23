import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, ShieldAlert, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { debugService } from '../../services/debugService';

interface SystemStatusProps {
  className?: string;
  showDetails?: boolean;
}

interface SystemHealth {
  connectivity: boolean;
  authentication: boolean;
  details: Record<string, any>;
}

const SystemStatus: React.FC<SystemStatusProps> = ({ className = '', showDetails = false }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      const healthData = await debugService.healthCheck();
      setHealth(healthData);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        connectivity: false,
        authentication: false,
        details: { error: error }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!health && !loading) {
    return null;
  }

  const ConnectivityIcon = health?.connectivity ? Wifi : WifiOff;
  const AuthIcon = health?.authentication ? Shield : ShieldAlert;
  const connectivityColor = health?.connectivity ? 'text-green-400' : 'text-red-400';
  const authColor = health?.authentication ? 'text-green-400' : 'text-yellow-400';

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">System Status</h3>
        <button
          onClick={checkSystemHealth}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        {/* Connectivity Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConnectivityIcon className={`w-4 h-4 ${connectivityColor}`} />
            <span className="text-sm text-gray-300">API Connection</span>
          </div>
          <div className="flex items-center gap-1">
            {health?.connectivity ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${connectivityColor}`}>
              {health?.connectivity ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AuthIcon className={`w-4 h-4 ${authColor}`} />
            <span className="text-sm text-gray-300">Authentication</span>
          </div>
          <div className="flex items-center gap-1">
            {health?.authentication ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-yellow-400" />
            )}
            <span className={`text-sm ${authColor}`}>
              {health?.authentication ? 'Valid' : 'Invalid/Expired'}
            </span>
          </div>
        </div>
      </div>

      {/* Last Checked */}
      {lastChecked && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <p className="text-xs text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && health?.details && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <details className="text-xs">
            <summary className="text-gray-400 cursor-pointer mb-2">Debug Details</summary>
            <pre className="text-gray-500 overflow-x-auto bg-zinc-800 p-2 rounded">
              {JSON.stringify(health.details, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Action Buttons */}
      {!health?.connectivity && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <p className="text-xs text-red-400 mb-2">
            Backend server appears to be down. Please check if it's running on the expected port.
          </p>
        </div>
      )}

      {health?.connectivity && !health?.authentication && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <p className="text-xs text-yellow-400 mb-2">
            Please log in again to refresh your authentication token.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-black px-2 py-1 rounded transition-colors"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;