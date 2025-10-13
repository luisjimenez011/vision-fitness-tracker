import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const RoutinesPage = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/routine/my-routines');
        setRoutines(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar las rutinas. Por favor, inténtalo de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  const handleStartWorkout = (routineId) => {
    navigate(`/track/${routineId}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Mis Rutinas Guardadas</h1>
      {routines.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No tienes rutinas guardadas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          {routines.map((routine) => (
            <div key={routine.id} style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '15px',
              width: '80%',
              maxWidth: '500px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>{routine.name}</h3>
                <p style={{ margin: 0, color: '#666' }}>
                  Creada: {new Date(routine.created_at).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => handleStartWorkout(routine.id)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Empezar Entrenamiento
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutinesPage;
