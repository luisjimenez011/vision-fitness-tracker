import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  // Simula el estado de autenticación. Inicializado en `true` por defecto.
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Simula la función de logout.
  const handleLogout = () => {
    console.log('Cerrando sesión...');
    setIsLoggedIn(false); // Cambia el estado para mostrar Login/Register
  };

  // Estilos en línea para la barra de navegación
  const navStyle = {
    backgroundColor: '#222',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 10px',
  };

  const buttonStyle = {
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
  };

  return (
    <nav style={navStyle}>
      {/* Sección Izquierda */}
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/routines" style={linkStyle}>Rutinas</Link>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
      </div>

      {/* Sección Derecha (Autenticación) */}
      <div>
        {isLoggedIn ? (
          <button onClick={handleLogout} style={buttonStyle}>Logout</button>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
