import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ... (style y MessageToast componentes se mantienen sin cambios)
const style = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    backgroundColor: '#ffffff',
  },
  input: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    width: '100px',
    textAlign: 'center',
  },
  buttonPrimary: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold',
  },
  buttonSecondary: {
    padding: '10px 15px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginLeft: '10px',
  },
  timerDisplay: {
    fontSize: '3em',
    fontWeight: '900',
    color: '#343a40',
    fontFamily: 'monospace',
  },
};

const MessageToast = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? '#dc3545' : '#28a745';
  const title = type === 'error' ? 'Error' : 'Éxito';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: bgColor,
      color: 'white',
      padding: '15px 25px',
      borderRadius: '8px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '300px'
    }}>
      <div>
        <strong>{title}:</strong> {message}
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2em', cursor: 'pointer' }}>
        &times;
      </button>
    </div>
  );
};


const TrackingPage = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState(null);
  const [currentDayWorkout, setCurrentDayWorkout] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [trackedSets, setTrackedSets] = useState([]);
  const [inputs, setInputs] = useState({}); 
  const [message, setMessage] = useState({ text: null, type: null });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: null, type: null }), 4000);
  };

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await apiClient.get(`/routine/${routineId}`);
        const fullRoutine = response.data;
        setRoutine(fullRoutine); // Guarda el objeto completo (incluye el nombre general)

        // 🛑 CORRECCIÓN CLAVE: Buscar el entrenamiento en el array 'workouts'
        // Sabemos que 'workouts' solo tiene un elemento gracias al getOne del backend
        const workouts = fullRoutine.plan_json?.workouts;
        
        if (workouts && workouts.length > 0) {
          // Tomamos el primer y único día de la rutina
          setCurrentDayWorkout(workouts[0]);
        } else {
          showMessage('El plan cargado no contiene ejercicios válidos para el seguimiento.', 'error');
        }
      } catch (error) {
        console.error('Error fetching routine:', error);
        showMessage('No se pudo cargar la rutina. Verifica tu ID.', 'error');
      }
    };

    fetchRoutine();
  }, [routineId]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const handleInputChange = (exerciseName, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        [field]: value,
      },
    }));
  };

  const handleAddSet = (exerciseName) => {
    if (!isRunning) {
      showMessage('Debes iniciar el cronómetro para registrar sets.', 'error');
      return;
    }
    
    const { weight, reps } = inputs[exerciseName] || { weight: '', reps: '' };
    
    if (!/^\d+(\.\d+)?$/.test(weight) || !/^\d+$/.test(reps)) {
      showMessage('Introduce solo valores numéricos válidos para Peso y Repeticiones.', 'error');
      return;
    }


    const newSet = {
      exerciseName,
      set: trackedSets.filter((s) => s.exerciseName === exerciseName).length + 1,
      weight: parseFloat(weight),
      reps: parseInt(reps, 10),
      timestamp: new Date().toISOString() 
    };

    setTrackedSets((prev) => [...prev, newSet]);
    showMessage(`Set ${newSet.set} de ${exerciseName} registrado.`, 'success');
    
    setInputs((prev) => ({
      ...prev,
      [exerciseName]: { weight: '', reps: '' },
    }));
  };

  const handleFinishWorkout = async () => {
    if (timer === 0) {
        showMessage('El entrenamiento no ha comenzado.', 'error');
        return;
    }

    if (trackedSets.length === 0) {
      showMessage('No has registrado sets. ¿Seguro que quieres finalizar?', 'error');
    }
    
    setIsRunning(false); // Detener cronómetro
    
    try {
      await apiClient.post('/workout/finish-session', {
        routineId: parseInt(routineId, 10),
        dayName: currentDayWorkout?.day || 'Día Desconocido',
        durationSeconds: timer,
        logData: trackedSets,
      });

      showMessage('¡Entrenamiento guardado con éxito!', 'success');
      
      setTimeout(() => navigate('/dashboard'), 1500); 

    } catch (error) {
      console.error('Error saving workout session:', error);
      showMessage('Hubo un error al guardar la sesión. Inténtalo de nuevo.', 'error');
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  if (!routine) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando rutina...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', background: '#f8f9fa', minHeight: '100vh' }}>
      <MessageToast 
        message={message.text} 
        type={message.type} 
        onClose={() => setMessage({ text: null, type: null })}
      />

      <h1 style={{ textAlign: 'center', color: '#343a40' }}>{routine.name}</h1>
      <h2 style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px', fontSize: '1.5em' }}>
        {currentDayWorkout?.day || 'Día Desconocido'}: {currentDayWorkout?.focus || 'Entrenamiento del día'}
      </h2>

      {/* Sección del Cronómetro y Controles */}
      <div style={{ textAlign: 'center', margin: '30px 0', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '12px' }}>
        <div style={style.timerDisplay}>{formatTime(timer)}</div>
        <div style={{ marginTop: '15px' }}>
          <button 
            onClick={() => setIsRunning(!isRunning)} 
            style={{ ...style.buttonPrimary, backgroundColor: isRunning ? '#ffc107' : '#28a745' }}
          >
            {isRunning ? 'Pausar' : (timer === 0 ? 'Empezar Entrenamiento' : 'Continuar')}
          </button>
          <button 
            onClick={handleFinishWorkout} 
            style={style.buttonSecondary}
            disabled={timer === 0}
          >
            Finalizar Entrenamiento
          </button>
        </div>
      </div>

      {/* Lista de Ejercicios */}
      {currentDayWorkout?.exercises?.map((exercise, index) => (
        <div key={index} style={style.card}>
          <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '5px', color: '#343a40' }}>{exercise.name}</h3>
          <p style={{ color: '#007bff', fontWeight: 'bold' }}>Plan: {exercise.sets} sets x {exercise.reps} reps</p>
          <p style={{ color: '#6c757d', fontSize: '0.9em' }}>Notas: {exercise.notes || 'N/A'}</p>

          {/* Sets registrados */}
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f2f2f2', borderRadius: '8px' }}>
            <h4>Progreso ({trackedSets.filter((s) => s.exerciseName === exercise.name).length} / {exercise.sets}):</h4>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {trackedSets
                .filter((s) => s.exerciseName === exercise.name)
                .map((s, i) => (
                  <li key={i} style={{ padding: '5px 0', borderBottom: '1px dotted #ccc' }}>
                    Set {s.set}: <strong>{s.weight} kg</strong> x {s.reps} reps
                  </li>
                ))}
            </ul>
          </div>

          {/* Formulario para nuevo set */}
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Peso (kg)"
              value={inputs[exercise.name]?.weight || ''}
              onChange={(e) => handleInputChange(exercise.name, 'weight', e.target.value)}
              style={style.input}
            />
            <input
              type="number"
              placeholder="Reps"
              value={inputs[exercise.name]?.reps || ''}
              onChange={(e) => handleInputChange(exercise.name, 'reps', e.target.value)}
              style={style.input}
            />
            <button 
              onClick={() => handleAddSet(exercise.name)}
              style={{ ...style.buttonPrimary, flexGrow: 1 }}
            >
              Añadir Set
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackingPage;