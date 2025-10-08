import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StationsPage from './pages/StationsPage';
import StationFormPage from './pages/StationFormPage';
import UsersPage from './pages/UsersPage';
import EVOwnersPage from './pages/EVOwnersPage';
import BookingsPage from './pages/BookingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

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
