import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
import LockOpenIcon from '@mui/icons-material/LockOpen'; 
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'; 

/**
 * Componente de la página de inicio de sesión.
 * Gestiona la autenticación del usuario, la navegación y el manejo de errores.
 */
function LoginPage() {
    // Hooks de React y de navegación/autenticación
    const auth = useAuth();
    const navigate = useNavigate();
    
    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Redirige al usuario a la página principal si ya está autenticado
        if (auth.isLoggedIn) {
            navigate('/', { replace: true }); 
        }
    }, [auth.isLoggedIn, navigate]);

    /**
     * Maneja el envío del formulario de inicio de sesión.
     * @param {Event} e - Evento de envío.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Envía la solicitud de login al backend
            const response = await apiClient.post('/auth/login', { email, password });
            
            // Llama a la función de login del contexto para guardar el token
            auth.login(response.data.token);
            
            // Redirige al usuario al dashboard tras el login exitoso
            navigate('/dashboard'); 
        } catch (err) {
            // Manejo de errores de autenticación
            if (err.response && err.response.data && err.response.data.error) {
                setError('Credenciales inválidas');
            } else {
                setError('Error de autenticación. Inténtalo de nuevo más tarde.');
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

                    {/* Botón principal de Login */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary" 
                        sx={{ mt: 3, mb: 2 }}
                        startIcon={<LockOpenIcon />}
                    >
                        Entrar
                    </Button>
                    
                    {/* Enlace de navegación a la página de Registro */}
                    <Button
                        fullWidth
                        variant="text" 
                        color="secondary" 
                        onClick={() => navigate('/register')}
                        startIcon={<AppRegistrationIcon />}
                        sx={{ mt: 1 }}
                    >
                        ¿No tienes una cuenta? Regístrate
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default LoginPage;