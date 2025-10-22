import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRouter from './router/AppRouter.jsx';
import Navbar from './components/Navbar.jsx';
import MainLayout from './components/MainLayout.jsx'; // ⭐️ IMPORTAR EL NUEVO LAYOUT
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { customTheme } from './theme'; 
import { Box } from '@mui/material'; // Para el contenedor flex principal

function App() {
    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline /> 
            
            <BrowserRouter>
                <AuthProvider>
                    {/* Contenedor principal para permitir la disposición Navbar fijo + Contenido */}
                    <Box sx={{ display: 'flex' }}>
                        <Navbar />
                        
                        {/* ⭐️ ENVOLVER APP-ROUTER CON MAIN-LAYOUT ⭐️ */}
                        <MainLayout>
                            <AppRouter />
                        </MainLayout>
                        
                    </Box>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;