import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';

function DashboardPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/workout/logs');
        setLogs(response.data);
      } catch (err) {
        setError('Error al cargar los logs de entrenamiento.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Dashboard - Historial de Entrenamientos</h1>
      <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Cerrar Sesión</button>
      
      {loading && <p>Cargando historial...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
        logs.length === 0 ? (
          <p>No tienes entrenamientos registrados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {logs.map(log => {
              const minutes = Math.floor(log.duration_seconds / 60);
              const seconds = log.duration_seconds % 60;
              return (
                <div key={log.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', margin: '10px 0', width: '80%', maxWidth: '600px' }}>
                  <h3 style={{ marginTop: 0 }}>{log.day_name || `Rutina #${log.routine_id}`}</h3>
                  <p><strong>Duración:</strong> {minutes} min {seconds} seg</p>
                  <p><strong>Fecha:</strong> {new Date(log.created_at).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

export default DashboardPage;
