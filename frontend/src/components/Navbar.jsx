import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  // CORRECCIÓN: Usamos el estado global y la función de logout del AuthContext
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Llama al método real del contexto
    navigate('/login'); // Redirige al usuario
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
           <Link to="/profile" style={linkStyle}>Perfil</Link>
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
