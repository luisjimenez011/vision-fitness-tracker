import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import apiClient from '../api/apiClient';


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
    TextField,
    // Componentes Responsive
    useMediaQuery,
    Drawer,
    AppBar,
} from '@mui/material';

// ÍCONOS NECESARIOS
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person'; 
import HomeIcon from '@mui/icons-material/Home'; 
import ViewListIcon from '@mui/icons-material/ViewList'; 
import DashboardIcon from '@mui/icons-material/Dashboard'; 
import SearchIcon from '@mui/icons-material/Search';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; 
import MenuIcon from '@mui/icons-material/Menu'; 

const DRAWER_WIDTH = 260; 

// ----------------------------------------------------
// CONTENIDO DEL SIDEBAR (Usado tanto en Drawer móvil como en Drawer fijo)
// ----------------------------------------------------
const SidebarContent = ({ userName, isLoggedIn, handleLogout, navItems, theme, location }) => (
    <Box 
        sx={{ 
            width: DRAWER_WIDTH, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'background.paper',
        }}
    >
        {/* 1. Encabezado / Logo de la Aplicación */}
        <Toolbar sx={{ height: 64, py: 2, px: 2, display: 'flex', alignItems: 'center' }}>
            <FitnessCenterIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="large" />
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                VISIONTRACKER
            </Typography>
        </Toolbar>



        {/* 3. Enlaces de Navegación Principal */}
        <List sx={{ flexGrow: 1, p: 1 }}>
            {navItems.map((item) => (
                <ListItem key={item.label} disablePadding>
                    <ListItemButton 
                        component={Link} 
                        to={item.path} 
                        // Lógica de selección para resaltar el elemento activo
                        selected={
                            (item.path === '/' && location.pathname === '/') || 
                            (item.path !== '/' && location.pathname.startsWith(item.path))
                        }
                        sx={{
                            borderRadius: theme.shape.borderRadius,
                            mb: 0.5,
                            '&.Mui-selected': {
                                backgroundColor: theme.palette.primary.dark + '30', 
                                color: theme.palette.primary.main,
                                '&:hover': { backgroundColor: theme.palette.primary.dark + '50' },
                            },
                            '& .MuiListItemIcon-root': {
                                // Color del icono basado en el estado de selección
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

        {/* 4. Perfil y Autenticación (Pie de página del Sidebar) */}
        <Box sx={{ 
            p: 1, 
            borderTop: `1px solid ${theme.palette.text.secondary}20`, 
            bgcolor: theme.palette.background.paper 
        }}>
            {isLoggedIn ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    {/* Enlace al perfil del usuario */}
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
                            primary={userName}
                            primaryTypographyProps={{ fontWeight: 'bold' }}
                        />
                    </ListItemButton>

                    {/* Botón de cierre de sesión (Logout) */}
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
                // Botones de Login/Register para usuarios no autenticados
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


// ----------------------------------------------------
// COMPONENTE NAVBAR PRINCIPAL
// ----------------------------------------------------
function Navbar() {
    const { isLoggedIn, logout } = useAuth(); 
    const [userName, setUserName] = useState("Perfil"); 
    // Controla si el Drawer (menú lateral) está abierto en dispositivos móviles
    const [mobileOpen, setMobileOpen] = useState(false); 

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    // Determina si la pantalla es de escritorio (sm o más grande)
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

    // Alterna el estado del menú móvil
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Lógica para obtener el nombre de usuario al iniciar sesión
    useEffect(() => {
        const fetchUserName = async () => {
            if (!isLoggedIn) {
                setUserName("Perfil");
                return;
            }
            try {
                const statsResponse = await apiClient.get("/profile/stats");
                setUserName(statsResponse.data.username || "Perfil"); 
            } catch (err) {
                console.error("Error al obtener el nombre de usuario:", err);
                setUserName("Perfil");
            }
        };
        fetchUserName();
    }, [isLoggedIn]); 
    
    // Cierra la sesión y redirige al login
    const handleLogout = () => {
        logout(); 
        setUserName("Perfil");
        navigate('/login'); 
    };

    // Definición de enlaces de navegación
    const navItems = [
        { label: 'Home', icon: <HomeIcon />, path: '/' },
        { label: 'Rutinas', icon: <ViewListIcon />, path: '/routines' },
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
    ];
    
    // Propiedades comunes pasadas al componente SidebarContent
    const sidebarProps = { userName, isLoggedIn, handleLogout, navItems, theme, location };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* 1. AppBar (Barra Superior Fija, visible SOLO en móvil) */}
            {!isDesktop && (
                <AppBar
                    position="fixed"
                    sx={{
                        width: '100%',
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    <Toolbar>
                        {/* Botón para abrir el menú móvil */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        {/* Logo/Título en la barra superior móvil */}
                        <FitnessCenterIcon sx={{ mr: 1 }} fontSize="medium" />
                        <Typography variant="h6" noWrap component="div">
                            VISIONTRACKER
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* 2. Componente de Navegación (Drawer para móvil, Sidebar fijo para desktop) */}
            <Box
                component="nav"
                sx={{ 
                    width: isDesktop ? DRAWER_WIDTH : 0, 
                    flexShrink: { sm: 0 } 
                }}
            >
                {/* 2a. Drawer temporal (Menú Móvil) */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }} // Optimización de rendimiento
                    sx={{
                        display: { xs: 'block', sm: 'none' }, // Mostrar solo en móvil
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                    }}
                >
                    <SidebarContent {...sidebarProps} />
                </Drawer>

                {/* 2b. Drawer permanente (Sidebar Fijo para Desktop) */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' }, // Mostrar solo en desktop
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: DRAWER_WIDTH,
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: 3, 
                        },
                    }}
                    open
                >
                    <SidebarContent {...sidebarProps} />
                </Drawer>
            </Box>
        </Box>
    );
}

export default Navbar;