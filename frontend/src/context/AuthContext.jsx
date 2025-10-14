import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Usamos isLoggedIn para coincidir con Navbar y ProtectedRoute
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // **CRÍTICO:** Configurar el header de Axios para futuras peticiones
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    // Configurar el header inmediatamente después del login
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Eliminar el header de Axios al cerrar sesión
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const contextValue = {
    isLoggedIn, // <-- Usamos isLoggedIn
    login,
    logout,
    loading: isLoading, // <-- Mapeamos isLoading a loading para ProtectedRoute
  };

  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};