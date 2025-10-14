import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';

// Componente auxiliar para renderizar la tarjeta de un día
const DayCard = ({ dayName, exercises }) => {
  
  // Estilos
  const cardStyle = {
    backgroundColor: 'black',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'left' 
  };

  const titleStyle = {
    borderBottom: '2px solid #000000ff',
    paddingBottom: '10px',
    marginBottom: '15px'
  };

  const exerciseListStyle = {
    listStyle: 'none',
    padding: 0
  };

  const exerciseItemStyle = {
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px dashed #e0e0e0'
  };

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>{dayName}</h3>
      <ul style={exerciseListStyle}>
        {Array.isArray(exercises) && exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <li key={index} style={exerciseItemStyle}>
               <strong>{exercise.name || 'Ejercicio Desconocido'}</strong> 
               <div>Sets: {exercise.sets || 'N/A'}</div>
               <div>Reps: {exercise.reps || 'N/A'}</div>
            </li>
          ))
        ) : (
          <li>No hay ejercicios definidos para este día.</li>
        )}
      </ul>
    </div>
  );
};

const RoutineDetailPage = () => {
  const { routineId } = useParams();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutineDetail = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/routine/${routineId}`);
        
        const routineData = response.data;
        
        // Deserialización segura
        let planJson = routineData.plan_json;
        if (typeof planJson === 'string') {
          planJson = JSON.parse(planJson);
        }
        routineData.plan_json = planJson;
        
        setRoutine(routineData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los detalles de la rutina.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutineDetail();
  }, [routineId]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

  if (!routine || !routine.plan_json) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>No se encontró el plan de la rutina.</div>;
  }
  
  // 🛑 CORRECCIÓN CLAVE: El plan_json ya viene con el array 'workouts' si es necesario (gracias al getOne del backend)
  const workoutsArray = routine.plan_json.workouts || []; 
  
  if (!Array.isArray(workoutsArray) || workoutsArray.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        No se encontraron sesiones de entrenamiento en esta rutina.
      </div>
    );
  }

  // El nombre de la rutina (routine.name) ahora es el nombre combinado (ej: Plan - Día 1)
  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>{routine.name}</h1>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
        {routine.plan_json.description || 'Sin descripción.'}
      </p>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Mapeamos el array de días (workouts), que ahora solo tendrá 1 elemento */}
        {workoutsArray.map((dayDetails, index) => (
          <DayCard 
            key={index} 
            dayName={dayDetails.day} // Usamos 'day' (ej: Día 1: Torso)
            exercises={dayDetails.exercises} // La lista de ejercicios para ese día
          />
        ))}
      </div>
    </div>
  );
};

export default RoutineDetailPage;