import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ⬇️ IMPORTACIONES DE MUI
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';


function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // 1. AppBar: Barra de navegación fija con tu color de superficie
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'background.paper', // Usamos el gris oscuro de tu tema
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Separador sutil
        boxShadow: 3 // Sombra ligera
      }}
    >
      <Toolbar>
        
        {/* Sección Izquierda: Enlaces principales */}
        {/* Box: Un contenedor flexible para manejar el layout */}
        <Box sx={{ flexGrow: 1 }}>
          <Button color="primary" component={Link} to="/" sx={{ mr: 1, textTransform: 'none' }}>
            Home
          </Button>
          <Button color="primary" component={Link} to="/routines" sx={{ mr: 1, textTransform: 'none' }}>
            Rutinas
          </Button>
          <Button color="primary" component={Link} to="/dashboard" sx={{ textTransform: 'none' }}>
            Dashboard
          </Button>
        </Box>

        {/* Sección Derecha: Perfil y Autenticación */}
        <Box>
          {/* Enlace a Perfil (siempre visible si estás logueado, ajusta esta lógica si es necesario) */}
          <Button 
            color="primary" 
            component={Link} 
            to="/profile" 
            startIcon={<PersonIcon />}
            sx={{ textTransform: 'none', mr: 2 }}
          >
            Perfil
          </Button>
            
          {/* Botón de Logout o Login/Register */}
          {isLoggedIn ? (
            // Botón Logout: Usamos el color 'error' para las acciones de salida/peligro
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout} 
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          ) : (
            <>
              {/* Login/Register con el color principal (Morado) */}
              <Button color="primary" component={Link} to="/login" sx={{ mr: 1 }}>
                Login
              </Button>
              <Button variant="contained" color="primary" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;