import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Componentes dummy
const HomePage = () => <div>HomePage</div>
const LoginPage = () => <div>LoginPage</div>
const RegisterPage = () => <div>RegisterPage</div>
const DashboardPage = () => <div>DashboardPage</div>

function ProtectedRoute({ element }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return element
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
    </Routes>
  )
}

export default AppRouter
