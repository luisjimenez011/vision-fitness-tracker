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
import RoutineEditPage from '../pages/RoutineEditPage';
import ProfilePage from '../pages/ProfilePage';

// Componente Protegido Corregido
function ProtectedRoute({ element }) {
  // CORRECCIÓN: Usamos la clave 'isLoggedIn' (la convención establecida) y 'loading'
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    // Es crucial esperar a que el estado de autenticación se cargue
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Verificando autenticación...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return element;
}

function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
      <Route path="/routines" element={<ProtectedRoute element={<RoutinesPage />} />} />
      <Route path="/routines/:routineId" element={<ProtectedRoute element={<RoutineDetailPage />} />} />
      <Route path="/track/:routineId" element={<ProtectedRoute element={<TrackingPage />} />} />
      <Route path="/routine/edit/:routineId" element={<RoutineEditPage />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />

    </Routes>
  );
}

export default AppRouter;
