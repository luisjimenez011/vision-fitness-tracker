import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const style = {
    container: { padding: '20px', maxWidth: '800px', margin: 'auto', background: '#f8f9fa', minHeight: '100vh' },
    card: { border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', backgroundColor: '#ffffff' },
    input: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', marginBottom: '10px' },
    smallInput: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '80px', textAlign: 'center' },
    buttonPrimary: { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.3s', fontWeight: 'bold' },
    buttonDanger: { padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' },
    buttonSecondary: { padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.3s', marginLeft: '10px' },
};

const RoutineEditPage = () => {
    const { routineId } = useParams();
    const navigate = useNavigate();

    // El estado almacena la estructura de la rutina que vamos a modificar
    const [editableRoutine, setEditableRoutine] = useState(null);
    const [originalRoutineName, setOriginalRoutineName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- LÓGICA DE CARGA DE DATOS ---
    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                const response = await apiClient.get(`/routine/${routineId}`);
                const routineData = response.data;
                
                // 🛑 Asumimos que el backend ya reformateó la rutina (getOne)
                // Usaremos SOLO el primer 'workout' ya que las rutinas de IA son sesiones diarias.
                const workout = routineData.plan_json?.workouts?.[0];

                if (!workout) {
                    setError('Estructura de rutina inválida para edición.');
                    setLoading(false);
                    return;
                }

                // Clonar la rutina y el workout para hacerlos editables
                setEditableRoutine({
                    name: routineData.name,
                    workout: { ...workout }
                });

                setOriginalRoutineName(routineData.name);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching routine:', err);
                setError('No se pudo cargar la rutina para edición.');
                setLoading(false);
            }
        };

        fetchRoutine();
    }, [routineId]);

    // --- LÓGICA DE MANEJO DE CAMBIOS ---

    const handleNameChange = (e) => {
        setEditableRoutine(prev => ({ ...prev, name: e.target.value }));
    };

    const handleExerciseChange = (index, field, value) => {
        setEditableRoutine(prev => {
            const newExercises = [...prev.workout.exercises];
            newExercises[index] = {
                ...newExercises[index],
                [field]: field === 'sets' || field === 'reps' ? parseInt(value, 10) || '' : value
            };
            return { ...prev, workout: { ...prev.workout, exercises: newExercises } };
        });
    };

    const handleRemoveExercise = (index) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
            setEditableRoutine(prev => {
                const newExercises = prev.workout.exercises.filter((_, i) => i !== index);
                return { ...prev, workout: { ...prev.workout, exercises: newExercises } };
            });
        }
    };

    const handleAddExercise = () => {
        setEditableRoutine(prev => {
            const newExercises = [
                ...prev.workout.exercises,
                { name: 'Nuevo Ejercicio', sets: 3, reps: 10, notes: '' } // Estructura básica
            ];
            return { ...prev, workout: { ...prev.workout, exercises: newExercises } };
        });
    };
    
    // --- LÓGICA DE GUARDADO ---

    const handleSaveChanges = async () => {
        if (!editableRoutine || !editableRoutine.name || editableRoutine.workout.exercises.length === 0) {
            alert('El nombre y al menos un ejercicio son obligatorios.');
            return;
        }

        try {
            // Reconstruimos el plan_json con la nueva estructura de una sesión individual
            const updatedPlanJson = {
                day: editableRoutine.workout.day,
                focus: editableRoutine.workout.focus,
                description: editableRoutine.workout.description || 'Sesión de entrenamiento individual modificada.',
                exercises: editableRoutine.workout.exercises,
            };
            
            // 🛑 El backend espera { name, plan_json }
            const payload = {
                name: editableRoutine.name,
                plan_json: updatedPlanJson,
            };

            await apiClient.put(`/routine/${routineId}`, payload);

            alert('Rutina actualizada con éxito!');
            navigate('/routines'); // Vuelve a la lista de rutinas

        } catch (err) {
            console.error('Error saving routine:', err);
            alert('Error al guardar la rutina. Revisa la consola para más detalles.');
        }
    };


    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando datos de edición...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;

    if (!editableRoutine) return null; // Fallback

    return (
        <div style={style.container}>
            <h1 style={{ textAlign: 'center', color: '#343a40' }}>Editar Rutina</h1>
            <h2 style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px', fontSize: '1.2em' }}>{originalRoutineName}</h2>

            {/* Edición del Nombre de la Rutina */}
            <div style={style.card}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nombre de la Rutina:</label>
                <input
                    type="text"
                    value={editableRoutine.name}
                    onChange={handleNameChange}
                    style={style.input}
                />
            </div>

            {/* Lista de Ejercicios Editables */}
            <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '5px', marginTop: '30px' }}>Ejercicios:</h3>

            {editableRoutine.workout.exercises.map((exercise, index) => (
                <div key={index} style={{ ...style.card, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Nombre del Ejercicio */}
                    <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                        style={{ ...style.input, fontSize: '1.2em', fontWeight: 'bold' }}
                    />
                    
                    {/* Sets y Reps */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '10px' }}>
                        <label>Sets:</label>
                        <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                            style={style.smallInput}
                        />
                        <label>Reps:</label>
                        <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                            style={style.smallInput}
                        />
                        <button 
                            onClick={() => handleRemoveExercise(index)} 
                            style={{ ...style.buttonDanger, marginLeft: 'auto' }}
                        >
                            Quitar
                        </button>
                    </div>

                    {/* Notas (Opcional) */}
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', marginTop: '10px' }}>Notas:</label>
                    <input
                        type="text"
                        placeholder="Notas adicionales (opcional)"
                        value={exercise.notes || ''}
                        onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                        style={style.input}
                    />
                </div>
            ))}

            {/* Controles para Añadir y Guardar */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button 
                    onClick={handleAddExercise} 
                    style={style.buttonPrimary}
                >
                    + Añadir Ejercicio
                </button>
                <button 
                    onClick={handleSaveChanges} 
                    style={style.buttonSecondary}
                >
                    Guardar Cambios
                </button>
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                    onClick={() => navigate('/routines')} 
                    style={{ ...style.buttonSecondary, backgroundColor: '#adb5bd' }}
                >
                    Cancelar y Volver
                </button>
            </div>
        </div>
    );
};

export default RoutineEditPage;