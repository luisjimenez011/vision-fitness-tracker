import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';


import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Alert, 
    Container, 
    Paper 
} from '@mui/material';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'; 
import LoginIcon from '@mui/icons-material/Login'; 

/**
 * Componente de la página de registro de usuario.
 * Permite a los nuevos usuarios crear una cuenta y maneja la navegación.
 */
function RegisterPage() {
    const navigate = useNavigate();
    
    // Estados para los campos del formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Estados para el manejo de mensajes de estado
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    /**
     * Maneja el envío del formulario de registro.
     * @param {Event} e - Evento de envío.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        try {
            // Envía la solicitud de registro al backend
            await apiClient.post('/auth/register', { name, email, password });
            
            // Manejo de éxito: muestra un mensaje y redirige después de 2 segundos
            setSuccessMessage('Registro exitoso. Serás redirigido para iniciar sesión.');
            setTimeout(() => navigate('/login'), 2000);
            
        } catch (err) {
            // Manejo de errores de la respuesta del servidor
            if (err.response && err.response.data && err.response.data.error) {
                // Si el error es un array de mensajes, los une
                const errorMessage = Array.isArray(err.response.data.error) 
                    ? err.response.data.error.join(', ') 
                    : err.response.data.error;
                setError(errorMessage);
            } else {
                setError('Error al registrar usuario. Inténtalo de nuevo.');
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
                    bgcolor: 'background.paper',
                }}
            >
                <Typography 
                    component="h1" 
                    variant="h4" 
                    gutterBottom 
                    color="primary"
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
                    {/* Campo Nombre de Usuario */}
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
                    
                    {/* Campo Correo Electrónico */}
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

                    {/* Mensajes de Error */}
                    {error && (
                        <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
                            {error}
                        </Alert>
                    )}
                    
                    {/* Mensaje de Éxito */}
                    {successMessage && (
                        <Alert severity="success" sx={{ mt: 2, mb: 1 }}>
                            {successMessage}
                        </Alert>
                    )}

                    {/* Botón de Registro */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                        startIcon={<AppRegistrationIcon />}
                    >
                        Registrarse
                    </Button>
                    
                    {/* Enlace para ir a Iniciar Sesión */}
                    <Button
                        fullWidth
                        variant="text"
                        color="secondary"
                        onClick={() => navigate('/login')}
                        startIcon={<LoginIcon />}
                        sx={{ mt: 1 }}
                    >
                        ¿Ya tienes una cuenta? Inicia Sesión
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default RegisterPage;