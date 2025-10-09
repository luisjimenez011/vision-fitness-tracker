import React, { createContext, useContext, useState, useEffect } from 'react';
// Asegúrate de que esta ruta sea correcta
import apiClient from '../api/apiClient'; 

// 1. Creación del Contexto
const AuthContext = createContext();

// Hook para usar la autenticación fácilmente
export const useAuth = () => useContext(AuthContext);

// 2. Componente Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  // Estado inicial: comprueba si existe un token en localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Función para Iniciar Sesión (guarda el token y actualiza el estado)
  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  // Función para Cerrar Sesión (elimina el token y actualiza el estado)
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const contextValue = {
    isAuthenticated,
    login,
    logout,
    isLoading,
  };

  if (isLoading) {
    // Esto muestra un mensaje mientras verifica el token al inicio
    return <div>Cargando autenticación...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};