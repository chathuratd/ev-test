import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StationsPage from './pages/StationsPage';
import StationFormPage from './pages/StationFormPage';
import DeactivateStationPage from './pages/DeactivateStationPage';
import UsersPage from './pages/UsersPage';
import EVOwnersPage from './pages/EVOwnersPage';
import BookingsPage from './pages/BookingsPage';
import { UserRole } from './types';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/stations" replace />} />

            {/* Backoffice only routes */}
            <Route
              path="dashboard"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.Backoffice]}>
                  <DashboardPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="users"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.Backoffice]}>
                  <UsersPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="ev-owners"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.Backoffice]}>
                  <EVOwnersPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="stations/new"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.Backoffice]}>
                  <StationFormPage />
                </RoleBasedRoute>
              }
            />

            {/* Routes accessible by both roles */}
            <Route path="stations" element={<StationsPage />} />
            <Route path="stations/:id/edit" element={<StationFormPage />} />
            <Route path="stations/:id/deactivate" element={<DeactivateStationPage />} />
            <Route path="bookings" element={<BookingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/stations" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
