import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient'; 

// Creación del contexto de autenticación
const AuthContext = createContext();

/**
 * Hook personalizado para acceder fácilmente al contexto de autenticación.
 * @returns {object} El valor del contexto de autenticación.
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Componente proveedor que gestiona el estado de autenticación de la aplicación.
 * @param {object} props - Los props del componente, incluyendo 'children'.
 * @returns {JSX.Element} El proveedor de contexto con los componentes hijos.
 */
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsLoggedIn(true);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
    }
    
    setIsLoading(false);
  }, []); 

  /**
   * Establece la sesión del usuario.
   * @param {string} token - El token de autenticación JWT.
   */
  const login = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; 
  };

  /**
   * Cierra la sesión del usuario.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Elimina el encabezado de autorización de Axios
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // Valor proporcionado al contexto
  const contextValue = {
    isLoggedIn, 
    login,
    logout,
    loading: isLoading,
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