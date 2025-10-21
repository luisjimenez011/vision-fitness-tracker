// src/theme.js
import { createTheme } from '@mui/material/styles';
import { grey, red } from '@mui/material/colors';

const PRIMARY_PURPLE = '#AA00FF'; 
const BACKGROUND_DARK = '#0A0A0A'; // Negro profundo para el fondo
const SURFACE_PAPER = '#1F1F1F'; // Gris oscuro para tarjetas y superficies
const TEXT_LIGHT = '#E0E0E0';    // Blanco/Gris claro para texto

export const customTheme = createTheme({
  palette: {
    mode: 'dark', 
    
    primary: {
      main: PRIMARY_PURPLE,
      light: '#C67FFF',
      dark: '#8E00E5',
    },
    
    error: {
      main: red[700], // Rojo para acciones de peligro (Eliminar, Logout)
    },
    
    background: {
      default: BACKGROUND_DARK, 
      paper: SURFACE_PAPER,     
    },
    
    text: {
      primary: TEXT_LIGHT,
      secondary: grey[500],
    },
  },
  
  // Estilo moderno: Bordes más redondeados
  shape: {
    borderRadius: 12,
  },
  
  components: {
    // Asegurarse de que todos los contenedores de MUI usen el color de superficie
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Desactivar gradientes por defecto
          backgroundColor: SURFACE_PAPER,
        },
      },
    },
    // Estilizar los botones para que el borde sea redondeado
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', 
        },
      },
    },
  },
});