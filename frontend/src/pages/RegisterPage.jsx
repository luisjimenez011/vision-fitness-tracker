import React, { useState } from 'react';
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
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'; // Ícono para el botón

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      // Funcionalidad intacta
      const response = await apiClient.post('/auth/register', { name, email, password });
      
      // Manejo de éxito con mensaje y redirección
      setSuccessMessage('Registro exitoso. Serás redirigido para iniciar sesión.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Manejo de errores
      if (err.response && err.response.data && err.response.data.error) {
        setError(Array.isArray(err.response.data.error) ? err.response.data.error.join(', ') : err.response.data.error);
      } else {
        setError('Error al registrar usuario');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: 'background.paper', // Gris oscuro de tu tema
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          gutterBottom 
          color="primary" // Morado vibrante
          sx={{ mb: 3 }}
        >
          Crear una Cuenta
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          noValidate 
          sx={{ mt: 1, width: '100%' }}
        >
          {/* Campo Nombre */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nombre de Usuario"
            name="name"
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            color="primary" 
          />
          
          {/* Campo Email */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            color="primary"
          />

          {/* Mensajes de Estado */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2, mb: 1 }}>
              {successMessage}
            </Alert>
          )}

          {/* Botón de Enviar */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary" // Morado vibrante
            sx={{ mt: 3, mb: 2 }}
            startIcon={<AppRegistrationIcon />}
          >
            Registrarse
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default RegisterPage;