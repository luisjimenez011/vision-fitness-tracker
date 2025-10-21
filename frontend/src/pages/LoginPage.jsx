import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ⬇️ IMPORTACIONES DE MUI
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Container, 
  Paper 
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen'; // Ícono para el botón

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.isLoggedIn) {
      // Corrección: el navigate de React Router toma un solo argumento para la ruta
      navigate('/', { replace: true }); 
    }
  }, [auth.isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      auth.login(response.data.token);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError('Credenciales inválidas');
      } else {
        setError('Error de autenticación. Inténtalo de nuevo más tarde.');
      }
    }
  };

  return (
    // Container: Centra el contenido; Box: Estilos de margen y padding
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: 'background.paper', // Color de superficie (gris oscuro)
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          gutterBottom 
          color="primary" // Color Morado
          sx={{ mb: 3 }}
        >
          Iniciar sesión
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          noValidate 
          sx={{ mt: 1, width: '100%' }}
        >
          {/* Campo Email */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            // Usamos el color primario (Morado) para el foco
            color="primary" 
          />
          
          {/* Campo Contraseña */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            color="primary"
          />

          {/* Mensaje de Error */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* Botón de Enviar */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary" // Morado vibrante
            sx={{ mt: 3, mb: 2 }}
            startIcon={<LockOpenIcon />}
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;