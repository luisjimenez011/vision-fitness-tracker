import React from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';

// Ancho del componente de navegación lateral (Navbar)
const DRAWER_WIDTH = 260; 

/**
 * Componente de layout principal que envuelve el contenido de la aplicación.
 * Gestiona el desplazamiento del contenido para evitar que quede oculto 
 * detrás del Navbar lateral (desktop) o el AppBar superior (móvil).
 * @param {object} props
 * @param {React.ReactNode} props.children - El contenido de la página a renderizar.
 */
function MainLayout({ children }) {
    const theme = useTheme();
    // Determina si la pantalla es de escritorio (breakpoint 'sm' o más grande)
    const isDesktop = useMediaQuery(theme.breakpoints.up('sm')); 
    
    return (
        <Box 
            component="main"
            sx={{
                flexGrow: 1,
                p: 3, // Padding uniforme para el contenido de la página
                minHeight: '100vh',
                bgcolor: theme.palette.background.default,

                // DESPLAZAMIENTO EN ESCRITORIO (sm+): Aplica margen izquierdo para acomodar el Navbar fijo.
                ml: { sm: `${DRAWER_WIDTH}px` }, 
                
                // DESPLAZAMIENTO EN MÓVIL (xs): Aplica margen superior para evitar el AppBar.
                mt: { xs: '64px', sm: 0 }, 
                
                // Ajusta el ancho para ocupar el espacio restante
                width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }
            }}
        >
            {/* Toolbar de Ajuste: En desktop, esta Toolbar "fantasma" añade el 
              espacio vertical necesario para que el contenido empiece justo debajo del logo/encabezado 
              de la Navbar (que es fijo y no desplaza el contenido).
            */}
            {isDesktop && <Toolbar />} 
            
            {children}
        </Box>
    );
}

export default MainLayout;