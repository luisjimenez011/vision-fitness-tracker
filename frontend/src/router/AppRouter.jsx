import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import RoutinesPage from '../pages/RoutinesPage';
import TrackingPage from '../pages/TrackingPage';
import RoutineDetailPage from '../pages/RoutineDetailPage';

function ProtectedRoute({ element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return element;
}

function AppRouter() {
  return (
    <Routes>
      {/* AI Routine Generation */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
      <Route path="/routines" element={<ProtectedRoute element={<RoutinesPage />} />} />
      <Route path="/routines/:routineId" element={<ProtectedRoute element={<RoutineDetailPage />} />} />
      <Route path="/track/:routineId" element={<ProtectedRoute element={<TrackingPage />} />} />
    </Routes>
  );
}

export default AppRouter;
