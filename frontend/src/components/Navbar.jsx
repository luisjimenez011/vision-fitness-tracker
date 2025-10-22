import React, { useState, useEffect } from 'react'; // ⭐️ Necesitamos useState y useEffect
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import apiClient from '../api/apiClient'; // ⭐️ Necesario para la llamada API

// ⬇️ IMPORTACIONES DE MUI
import { 
    Box, 
    Typography, 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Button, 
    Toolbar, 
    useTheme,
    IconButton,
    TextField 
} from '@mui/material';

// ⬇️ ÍCONOS NECESARIOS
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person'; 
import HomeIcon from '@mui/icons-material/Home'; 
import ViewListIcon from '@mui/icons-material/ViewList'; 
import DashboardIcon from '@mui/icons-material/Dashboard'; 
import SearchIcon from '@mui/icons-material/Search';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; 

// Ancho del Sidebar (260px)
const DRAWER_WIDTH = 260; 

function Navbar() {
    // Solo obtenemos isLoggedIn y las funciones, como en tu AuthContext original.
    const { isLoggedIn, logout } = useAuth(); 
    
    // ⭐️ ESTADO NUEVO: Para almacenar el nombre de usuario de la API
    const [userName, setUserName] = useState("Perfil"); 

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    // ⭐️ LÓGICA DE FETCH: Obtener el nombre de usuario al loguearse o al cargar la app
    useEffect(() => {
        const fetchUserName = async () => {
            if (!isLoggedIn) {
                setUserName("Perfil"); // Resetear si no está logueado
                return;
            }

            try {
                // Hacemos la MISMA llamada que se usa en ProfilePage para obtener el username
                const statsResponse = await apiClient.get("/profile/stats");
                
                // Usamos el username devuelto por la API
                setUserName(statsResponse.data.username || "Perfil"); 

            } catch (err) {
                console.error("Error al obtener el nombre de usuario para Navbar:", err);
                setUserName("Perfil"); // Fallback en caso de error
            }
        };

        fetchUserName();
        
        // Dependencia: Se ejecuta cada vez que el estado de login cambia
    }, [isLoggedIn]); 
    
    
    const handleLogout = () => {
        logout(); 
        setUserName("Perfil"); // Limpiamos el nombre localmente
        navigate('/login'); 
    };

    // Mapeo de enlaces con Íconos (HOME, RUTINAS, DASHBOARD, PROFILE)
    const navItems = [
        { label: 'Home', icon: <HomeIcon />, path: '/' },
        { label: 'Rutinas', icon: <ViewListIcon />, path: '/routines' },
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
    ];

    return (
        // 1. Contenedor principal (Sidebar fijo)
        <Box 
            sx={{ 
                width: DRAWER_WIDTH, 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                bgcolor: 'background.paper',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 3,
                position: 'fixed', 
                top: 0,
                left: 0,
            }}
        >
            {/* 2. Encabezado / Logo */}
            <Toolbar sx={{ height: 64, py: 2, px: 2, display: 'flex', alignItems: 'center' }}>
                <FitnessCenterIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="large" />
                <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                    HEVY
                </Typography>
            </Toolbar>

            {/* 3. Caja de Búsqueda (Search users) */}
            <Box sx={{ p: 2, pt: 0 }}>
                <TextField
                    fullWidth
                    placeholder="Search users"
                    size="small"
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                        sx: { borderRadius: theme.shape.borderRadius }
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: theme.palette.background.default, 
                            '& fieldset': { borderColor: 'transparent' },
                            '&:hover fieldset': { borderColor: theme.palette.primary.main },
                            '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                        },
                    }}
                />
            </Box>

            {/* 4. Enlaces de Navegación (Lista) */}
            <List sx={{ flexGrow: 1, p: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton 
                            component={Link} 
                            to={item.path} 
                            // Lógica de selección para marcar el enlace activo
                            selected={
                                (item.path === '/' && location.pathname === '/') || 
                                (item.path !== '/' && location.pathname.startsWith(item.path))
                            }
                            sx={{
                                borderRadius: theme.shape.borderRadius,
                                mb: 0.5,
                                // Estilo de Hevy para elemento seleccionado
                                '&.Mui-selected': {
                                    backgroundColor: theme.palette.primary.dark + '30', 
                                    color: theme.palette.primary.main,
                                    '&:hover': { backgroundColor: theme.palette.primary.dark + '50' },
                                },
                                '& .MuiListItemIcon-root': {
                                    color: (item.path === '/' && location.pathname === '/') || (item.path !== '/' && location.pathname.startsWith(item.path)) ? theme.palette.primary.main : theme.palette.text.primary,
                                },
                                color: theme.palette.text.primary 
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: '600' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* 6. Perfil del Usuario y Autenticación (Pie de página) */}
            <Box sx={{ 
                p: 1, 
                borderTop: `1px solid ${theme.palette.text.secondary}20`, 
                bgcolor: theme.palette.background.paper 
            }}>
                {isLoggedIn ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        
                        {/* Botón 1: Perfil de Usuario (Icono + Nombre) */}
                        <ListItemButton 
                            component={Link} 
                            to="/profile" 
                            sx={{ 
                                flexGrow: 1, 
                                borderRadius: theme.shape.borderRadius,
                                mr: 1
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 40, mr: 1, color: 'text.secondary' }} /> 
                            <ListItemText 
                                primary={userName} // ⭐️ Usamos el estado local 'userName'
                                primaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                        </ListItemButton>

                        {/* Botón 2: Logout (Solo Icono) */}
                        <IconButton 
                            onClick={handleLogout} 
                            color="error"
                            sx={{
                                p: 1,
                                borderRadius: theme.shape.borderRadius,
                                '&:hover': {
                                    backgroundColor: theme.palette.error.light + '20',
                                }
                            }}
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                ) : (
                    // FUNCIONALIDAD: Botones de Login/Register
                    <Box sx={{ display: 'flex', p: 1 }}>
                        <Button color="primary" component={Link} to="/login" sx={{ mr: 1, flexGrow: 1 }}>
                            Login
                        </Button>
                        <Button variant="contained" color="primary" component={Link} to="/register" sx={{ flexGrow: 1 }}>
                            Register
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Navbar;