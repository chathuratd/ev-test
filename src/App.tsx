import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import EVOwnerProtectedRoute from './components/common/EVOwnerProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import EVOwnerLayout from './components/layout/EVOwnerLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StationsPage from './pages/StationsPage';
import StationFormPage from './pages/StationFormPage';
import UsersPage from './pages/UsersPage';
import EVOwnersPage from './pages/EVOwnersPage';
import BookingsPage from './pages/BookingsPage';
import EVOwnerLoginPage from './pages/EVOwnerLoginPage';
import EVOwnerRegisterPage from './pages/EVOwnerRegisterPage';
import EVOwnerDashboardPage from './pages/EVOwnerDashboardPage';
import EVOwnerStationsPage from './pages/EVOwnerStationsPage';
import EVOwnerBookingsPage from './pages/EVOwnerBookingsPage';
import EVOwnerBookStationPage from './pages/EVOwnerBookStationPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ev-owner-login" element={<EVOwnerLoginPage />} />
          <Route path="/ev-owner-register" element={<EVOwnerRegisterPage />} />
          
          {/* EV Owner Protected Routes */}
          <Route 
            path="/ev-owner-dashboard" 
            element={
              <EVOwnerProtectedRoute>
                <EVOwnerLayout />
              </EVOwnerProtectedRoute>
            }
          >
            <Route index element={<EVOwnerDashboardPage />} />
          </Route>
          <Route 
            path="/ev-owner" 
            element={
              <EVOwnerProtectedRoute>
                <EVOwnerLayout />
              </EVOwnerProtectedRoute>
            }
          >
            <Route path="stations" element={<EVOwnerStationsPage />} />
            <Route path="bookings" element={<EVOwnerBookingsPage />} />
            <Route path="book-station" element={<EVOwnerBookStationPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="stations" element={<StationsPage />} />
            <Route path="stations/new" element={<StationFormPage />} />
            <Route path="stations/:id/edit" element={<StationFormPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="ev-owners" element={<EVOwnersPage />} />
            <Route path="bookings" element={<BookingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
