import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const RoutinesPage = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para cargar las rutinas (necesaria para refrescar después de eliminar)
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
    
  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleStartWorkout = (routineId) => {
    navigate(`/track/${routineId}`);
  };

  const handleEditRoutine = (routineId) => {
    navigate(`/routine/edit/${routineId}`);
  };

  // 🛑 NUEVA FUNCIÓN: Manejar la eliminación
  const handleDeleteRoutine = async (routineId, routineName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la rutina "${routineName}"? Esta acción es irreversible.`)) {
      return;
    }

    try {
      // Llama al endpoint DELETE que creamos en el backend
      await apiClient.delete(`/routine/${routineId}`);
      alert('Rutina eliminada con éxito.');
      // Refrescar la lista de rutinas para que desaparezca la eliminada
      fetchRoutines(); 
    } catch (err) {
      console.error('Error al eliminar la rutina:', err);
      // Manejo de errores 403 (acceso denegado) o 404 (no encontrada)
      const errorMessage = err.response?.data?.error || 'Error del servidor al eliminar la rutina.';
      alert(`Error al eliminar: ${errorMessage}`);
    }
  };


  const buttonStyle = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px', // Separación entre botones
    fontWeight: 'bold',
  };

  const startButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ffc107', // Amarillo para la edición
    color: '#343a40',
  };
    
  // 🛑 NUEVO ESTILO: Para el botón de eliminar
  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545', // Rojo para la eliminación
    color: 'white',
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
            <div 
              key={routine.id} 
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                width: '80%',
                maxWidth: '500px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>{routine.name}</h3>
                <p style={{ margin: 0, color: '#666' }}>
                  Creada: {new Date(routine.created_at).toLocaleDateString()}
                </p>
            </div>
              
              {/* 🛑 Contenedor de Botones con la nueva opción de Eliminar */}
              <div style={{ display: 'flex' }}>
                    {/* Botón de Eliminar */}
                    <button 
                      onClick={() => handleDeleteRoutine(routine.id, routine.name)}
                      style={deleteButtonStyle}
                    >
                      Eliminar 🗑️
                    </button>

                    <button 
                      onClick={() => handleEditRoutine(routine.id)}
                      style={editButtonStyle}
                    >
                      Editar ✏️
                    </button>

                    <button 
                      onClick={() => handleStartWorkout(routine.id)}
                      style={startButtonStyle}
                    >
                      Empezar 💪
                    </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutinesPage;