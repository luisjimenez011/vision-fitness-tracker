import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRouter from './router/AppRouter.jsx';
import Navbar from './components/Navbar.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;