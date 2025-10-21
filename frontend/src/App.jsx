import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRouter from './router/AppRouter.jsx';
import Navbar from './components/Navbar.jsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { customTheme } from './theme'; 


function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline /> 
      
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;