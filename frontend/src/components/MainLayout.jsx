import React from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';

// El mismo ancho que definiste en Navbar.jsx
const DRAWER_WIDTH = 260; 

/**
 * Componente de layout que gestiona el desplazamiento del contenido 
 * principal para que no quede oculto detrás del Navbar (desktop) 
 * o el AppBar (móvil).
 */
function MainLayout({ children }) {
    const theme = useTheme();
    // Verifica si estamos en una pantalla de escritorio (sm o más grande)
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm')); 
    
    return (
        <Box 
            component="main"
            sx={{
                flexGrow: 1,
                p: 3, // Padding general para el contenido de la página
                minHeight: '100vh',
                bgcolor: theme.palette.background.default,

                // ⭐️ DESPLAZAMIENTO EN ESCRITORIO (Navbar Lateral)
                // En desktop (sm+), añade un margen izquierdo para empezar después del Navbar fijo.
                ml: { sm: `${DRAWER_WIDTH}px` }, 
                
                // ⭐️ DESPLAZAMIENTO EN MÓVIL (AppBar Superior)
                // La altura del AppBar es de 64px. Añadimos un margen superior solo en móvil.
                mt: { xs: '64px', sm: 0 }, 
                
                // Asegura que el contenido ocupe el 100% del espacio restante
                width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }
            }}
        >
            {/* Toolbar de Ajuste: En desktop, la Navbar fija no empuja el contenido hacia abajo.
                Este Toolbar "fantasma" fuerza al contenido a empezar por debajo del logo 
                (que está dentro de la Toolbar del Navbar fijo).
            */}
            {isDesktop && <Toolbar />} 
            
            {/* Aquí se renderizarán todas tus páginas (AppRouter) */}
            {children}
        </Box>
    );
}

export default MainLayout;