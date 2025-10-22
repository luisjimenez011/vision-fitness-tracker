import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import apiClient from '../api/apiClient';

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
    TextField,
    // Importaciones Responsive
    useMediaQuery,
    Drawer,
    AppBar,
    CssBaseline,
} from '@mui/material';

// ⬇️ ÍCONOS NECESARIOS
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person'; 
import HomeIcon from '@mui/icons-material/Home'; 
import ViewListIcon from '@mui/icons-material/ViewList'; 
import DashboardIcon from '@mui/icons-material/Dashboard'; 
import SearchIcon from '@mui/icons-material/Search';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'; 
import MenuIcon from '@mui/icons-material/Menu'; // Icono de menú

const DRAWER_WIDTH = 260; 

// ----------------------------------------------------
// ⭐️ FUNCIÓN PRINCIPAL: Contenido del Sidebar (Lista, Perfil, Logout)
// Lo extraemos para usarlo tanto en el Drawer (móvil) como en el Box (desktop)
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
        {/* 2. Encabezado / Logo */}
        <Toolbar sx={{ height: 64, py: 2, px: 2, display: 'flex', alignItems: 'center' }}>
            <FitnessCenterIcon sx={{ color: 'primary.main', mr: 1 }} fontSize="large" />
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                VISIONTRACKER
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
                            primary={userName}
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
                // Botones de Login/Register
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
// ⭐️ COMPONENTE NAVBAR PRINCIPAL
// ----------------------------------------------------
function Navbar() {
    const { isLoggedIn, logout } = useAuth(); 
    const [userName, setUserName] = useState("Perfil"); 
    // ⭐️ NUEVO ESTADO: Controla si el Drawer (menú móvil) está abierto
    const [mobileOpen, setMobileOpen] = useState(false); 

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    // ⭐️ DETECCIÓN DE PANTALLA: true si la pantalla es sm (600px) o más grande (desktop)
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

    // Función para manejar la apertura/cierre del menú móvil
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Lógica de Fetch (manteniéndola igual)
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
                console.error("Error al obtener el nombre de usuario para Navbar:", err);
                setUserName("Perfil");
            }
        };
        fetchUserName();
    }, [isLoggedIn]); 
    
    
    const handleLogout = () => {
        logout(); 
        setUserName("Perfil");
        navigate('/login'); 
    };

    const navItems = [
        { label: 'Home', icon: <HomeIcon />, path: '/' },
        { label: 'Rutinas', icon: <ViewListIcon />, path: '/routines' },
        { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
    ];
    
    // Propiedades comunes para el contenido del Sidebar
    const sidebarProps = { userName, isLoggedIn, handleLogout, navItems, theme, location };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* 1. Barra Superior para Móviles (AppBar) */}
            {/* Se muestra SOLO si NO es desktop */}
            {!isDesktop && (
                <AppBar
                    position="fixed"
                    sx={{
                        width: '100%',
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    <Toolbar>
                        {/* Ícono de menú que abre el Drawer */}
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

            {/* 2. Navegación Fija (Desktop) / Drawer (Móvil) */}
            <Box
                component="nav"
                sx={{ 
                    width: isDesktop ? DRAWER_WIDTH : 0, 
                    flexShrink: { sm: 0 } 
                }}
                aria-label="mailbox folders"
            >
                {/* 2a. Drawer (Menú Móvil) */}
                <Drawer
                    // Se muestra SÓLO en pantallas pequeñas
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }} // Para mejor rendimiento
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                    }}
                >
                    {/* Contenido extraído del Sidebar */}
                    <SidebarContent {...sidebarProps} />
                </Drawer>

                {/* 2b. Sidebar Fijo (Desktop) */}
                <Drawer
                    // Se muestra SÓLO en pantallas grandes
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: DRAWER_WIDTH,
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)', // Añadir el borde
                            boxShadow: 3, // Añadir la sombra
                        },
                    }}
                    open
                >
                    {/* Contenido extraído del Sidebar */}
                    <SidebarContent {...sidebarProps} />
                </Drawer>
            </Box>

            {/* ⭐️ NOTA IMPORTANTE: 
            Tu componente principal (ej: App.js o MainLayout.js) debe manejar el 
            margen/padding para que el contenido de la aplicación no quede oculto 
            detrás del Navbar fijo (desktop) o el AppBar superior (móvil).
            */}
        </Box>
    );
}

export default Navbar;