import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ----------------------------------------------------
// ESTILOS
// ----------------------------------------------------
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
  smallInput: { // Estilo para los inputs de edición dentro del log
    padding: '4px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '60px',
    textAlign: 'center',
    margin: '0 5px',
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
  buttonDanger: { // Estilo para el botón de eliminar set
    padding: '4px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
    fontSize: '0.8em'
  },
  timerDisplay: {
    fontSize: '3em',
    fontWeight: '900',
    color: '#343a40',
    fontFamily: 'monospace',
  },
};

// ----------------------------------------------------
// COMPONENTE MessageToast (sin cambios)
// ----------------------------------------------------
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

// ----------------------------------------------------
// COMPONENTE TrackingPage
// ----------------------------------------------------
const TrackingPage = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState(null);
  const [currentDayWorkout, setCurrentDayWorkout] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [trackedSets, setTrackedSets] = useState([]);
  
  // Estado para controlar los inputs de la nueva serie
  const [inputs, setInputs] = useState({}); 
  // Estado para controlar el modo 'Peso Corporal' por ejercicio
  const [isBodyweightMode, setIsBodyweightMode] = useState({}); 
  
  const [message, setMessage] = useState({ text: null, type: null });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: null, type: null }), 4000);
  };

  // Lógica para cargar la rutina
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const response = await apiClient.get(`/routine/${routineId}`);
        const fullRoutine = response.data;
        setRoutine(fullRoutine);

        const workouts = fullRoutine.plan_json?.workouts;
        
        if (workouts && workouts.length > 0) {
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

  // Lógica del Cronómetro
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

  // Manejador genérico de inputs para la nueva serie
  const handleInputChange = (exerciseName, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        [field]: value,
      },
    }));
  };

  // Función auxiliar para re-numerar las series después de una eliminación o adición
  const reindexSets = (sets) => {
    const indexedSets = [];
    const exerciseSetCounts = {};

    // Iteramos sobre el array de sets en el orden en que se registraron/modificaron
    sets.forEach(set => {
      const name = set.exerciseName;
      exerciseSetCounts[name] = (exerciseSetCounts[name] || 0) + 1;
      indexedSets.push({
        ...set,
        // Asignamos el nuevo número de set
        set: exerciseSetCounts[name]
      });
    });
    return indexedSets;
  };
  
  // Función para obtener el índice real del set en el array global 'trackedSets'
  // Esto es crucial para la edición/eliminación.
  const getGlobalSetIndex = (exerciseName, setIndexInExercise) => {
    let count = 0;
    for (let i = 0; i < trackedSets.length; i++) {
      if (trackedSets[i].exerciseName === exerciseName) {
        count++;
        if (count === setIndexInExercise) {
          return i;
        }
      }
    }
    return -1;
  };

  // Lógica para añadir una nueva serie
  const handleAddSet = (exerciseName) => {
    if (!isRunning) {
      showMessage('Debes iniciar el cronómetro para registrar sets.', 'error');
      return;
    }
    
    const isBodyweight = isBodyweightMode[exerciseName] || false; // ¿Está marcado el modo BW?

    let { weight, reps } = inputs[exerciseName] || { weight: '', reps: '' };
    
    // Validación de Reps (siempre requerida)
    if (!/^\d+$/.test(reps) || parseInt(reps, 10) <= 0) {
      showMessage('Introduce solo un valor numérico válido (> 0) para Repeticiones.', 'error');
      return;
    }
    
    // Validación de Peso (solo si NO es Bodyweight)
    if (!isBodyweight) {
      if (!/^\d+(\.\d+)?$/.test(weight) || parseFloat(weight) < 0) {
        showMessage('Introduce un valor numérico válido (>= 0) para Peso.', 'error');
        return;
      }
    } else {
      weight = 0; // Si es BW, el peso registrado es 0
    }


    const newSet = {
      exerciseName,
      // El número de set se recalculará en reindexSets
      set: 0, 
      weight: parseFloat(weight), 
      reps: parseInt(reps, 10),
      isBodyweight: isBodyweight, // Guardamos la bandera en el log
      timestamp: new Date().toISOString() 
    };

    setTrackedSets((prev) => {
      const newSets = [...prev, newSet];
      // Re-indexar los sets para tener el orden correcto
      return reindexSets(newSets);
    });
    
    showMessage(`Set registrado.`, 'success');
    
    // Limpiamos los inputs
    setInputs((prev) => ({
      ...prev,
      [exerciseName]: { weight: isBodyweight ? '' : '', reps: '' },
    }));
  };
  
  /**
   * Actualiza el peso o las reps de un set en el array.
   * @param {number} index - Índice del set en el array trackedSets.
   * @param {string} field - 'weight' o 'reps'.
   * @param {string} value - Nuevo valor del input (string).
   */
  const handleUpdateSet = (index, field, value) => {
    
    // Pre-validación simple para evitar valores no numéricos mientras se teclea
    if (field === 'reps' && !/^\d*$/.test(value)) return;
    if (field === 'weight' && !/^\d*(\.\d*)?$/.test(value)) return;
    
    // Si el campo está vacío, lo tratamos como 0 para permitir al usuario borrar el input
    const numericValue = value === '' ? 0 : parseFloat(value);
    
    setTrackedSets(prevSets => {
      const newSets = [...prevSets];
      newSets[index] = {
        ...newSets[index],
        [field]: numericValue
      };
      return newSets;
    });
  };

  /**
   * Elimina un set por su índice y re-indexa los sets.
   * @param {number} index - Índice del set a eliminar en el array trackedSets.
   */
  const handleRemoveSet = (index, setNumber, exerciseName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el Set ${setNumber} de ${exerciseName}?`)) {
      return;
    }

    setTrackedSets(prevSets => {
      const newSets = prevSets.filter((_, i) => i !== index);
      showMessage('Set eliminado.', 'success');
      // Re-indexar para que los números de set sean secuenciales
      return reindexSets(newSets); 
    });
  };


  // Lógica para finalizar el entrenamiento
  const handleFinishWorkout = async () => {
    if (timer === 0) {
        showMessage('El entrenamiento no ha comenzado.', 'error');
        return;
    }

    if (trackedSets.length === 0 && !window.confirm('No has registrado sets. ¿Seguro que quieres finalizar el entrenamiento sin guardar progreso?')) {
      return;
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
                .map((s) => {
                    // Obtenemos el índice real del set en el array global trackedSets
                    const globalIndex = getGlobalSetIndex(s.exerciseName, s.set); 
                    
                    // Manejamos la visualización de "BW"
                    const isSetBodyweight = s.isBodyweight || false;

                    return (
                      <li 
                        key={s.timestamp + s.set}
                        style={{ 
                          padding: '5px 0', 
                          borderBottom: '1px dotted #ccc',
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          Set {s.set}:
                          
                          {/* Etiqueta BW si aplica */}
                          <span style={{ marginRight: '5px', fontWeight: 'bold', color: isSetBodyweight ? '#28a745' : 'inherit' }}>
                            {isSetBodyweight ? 'BW' : ''}
                          </span>

                          {/* Input editable para Peso */}
                          <input
                            type="number"
                            value={s.weight || ''} // Usamos '' para que el 0 no aparezca en el input
                            onChange={(e) => handleUpdateSet(globalIndex, 'weight', e.target.value)}
                            style={style.smallInput}
                            disabled={isSetBodyweight} // Deshabilitar si se registró como BW
                          /> 
                          {!isSetBodyweight && 'kg'} x
                          
                          {/* Input editable para Reps */}
                          <input
                            type="number"
                            value={s.reps}
                            onChange={(e) => handleUpdateSet(globalIndex, 'reps', e.target.value)}
                            style={style.smallInput}
                          /> reps
                        </div>
                        
                        {/* Botón de Eliminar */}
                        <button 
                          onClick={() => handleRemoveSet(globalIndex, s.set, s.exerciseName)} 
                          style={style.buttonDanger}
                        >
                          Eliminar
                        </button>
                      </li>
                    );
                })}
            </ul>
          </div>

          {/* Formulario para nuevo set */}
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Checkbox de Peso Corporal (BW) */}
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                <input 
                    type="checkbox" 
                    id={`bw-${exercise.name}`}
                    checked={isBodyweightMode[exercise.name] || false}
                    onChange={(e) => {
                        setIsBodyweightMode(prev => ({ 
                            ...prev, 
                            [exercise.name]: e.target.checked 
                        }));
                        // Limpiar el input de peso si se activa
                        if(e.target.checked) {
                            setInputs(prev => ({
                                ...prev,
                                [exercise.name]: { ...prev[exercise.name], weight: '' }
                            }));
                        }
                    }}
                    style={{ marginRight: '5px' }}
                />
                <label htmlFor={`bw-${exercise.name}`} style={{ fontSize: '0.9em', color: '#6c757d' }}>
                    Sin peso adicional (Calistenia)
                </label>
            </div>

            {/* Input de Peso */}
            <input
              type="number"
              placeholder="Peso (kg)"
              value={inputs[exercise.name]?.weight || ''}
              onChange={(e) => handleInputChange(exercise.name, 'weight', e.target.value)}
              style={style.input}
              disabled={isBodyweightMode[exercise.name]}
            />
            {/* Input de Reps */}
            <input
              type="number"
              placeholder="Reps"
              value={inputs[exercise.name]?.reps || ''}
              onChange={(e) => handleInputChange(exercise.name, 'reps', e.target.value)}
              style={style.input}
            />
            {/* Botón Añadir Set */}
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