import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ⬇️ IMPORTACIONES DE MUI
import {
    Container,
    Box,
    Typography,
    Card,
    TextField,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    InputAdornment, // Para iconos en TextFields
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const RoutineEditPage = () => {
    const { routineId } = useParams();
    const navigate = useNavigate();

    const [editableRoutine, setEditableRoutine] = useState(null);
    const [originalRoutineName, setOriginalRoutineName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- LÓGICA DE CARGA DE DATOS (Sin cambios) ---
    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                const response = await apiClient.get(`/routine/${routineId}`);
                const routineData = response.data;
                
                // Usamos SOLO el primer 'workout'
                const workout = routineData.plan_json?.workouts?.[0];

                if (!workout) {
                    setError('Estructura de rutina inválida para edición.');
                    setLoading(false);
                    return;
                }

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

    // --- LÓGICA DE MANEJO DE CAMBIOS (Mantenida, adaptada a MUI) ---

    const handleNameChange = (e) => {
        setEditableRoutine(prev => ({ ...prev, name: e.target.value }));
    };

    const handleExerciseChange = (index, field, value) => {
        setEditableRoutine(prev => {
            const newExercises = [...prev.workout.exercises];
            // Aseguramos que 'sets' y 'reps' sean números (o cadena vacía)
            const parsedValue = field === 'sets' || field === 'reps' ? parseInt(value, 10) || '' : value;

            newExercises[index] = {
                ...newExercises[index],
                [field]: parsedValue
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
                { name: 'Nuevo Ejercicio', sets: 3, reps: 10, notes: '' }
            ];
            return { ...prev, workout: { ...prev.workout, exercises: newExercises } };
        });
    };
    
    // --- LÓGICA DE GUARDADO (Sin cambios) ---

    const handleSaveChanges = async () => {
        if (!editableRoutine || !editableRoutine.name || editableRoutine.workout.exercises.length === 0) {
            alert('El nombre y al menos un ejercicio son obligatorios.');
            return;
        }

        try {
            // Reconstruimos la estructura para el backend
            const updatedPlanJson = {
                workouts: [{ // Empaquetamos en el array 'workouts' de nuevo
                    day: editableRoutine.workout.day,
                    focus: editableRoutine.workout.focus,
                    description: editableRoutine.workout.description || 'Sesión de entrenamiento individual modificada.',
                    exercises: editableRoutine.workout.exercises,
                }]
            };
            
            const payload = {
                name: editableRoutine.name,
                // El backend espera plan_json como JSON serializado si no es un campo JSON nativo
                plan_json: updatedPlanJson, 
            };
            
            // Si tu API necesita la cadena JSON, usa: JSON.stringify(updatedPlanJson)
            // Aquí asumimos que apiClient maneja la serialización, enviando el objeto.

            await apiClient.put(`/routine/${routineId}`, payload);

            alert('Rutina actualizada con éxito!');
            navigate('/routines');

        } catch (err) {
            console.error('Error saving routine:', err.response?.data || err.message);
            alert(`Error al guardar la rutina: ${err.response?.data?.error || 'Error de servidor'}`);
        }
    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Cargando datos de edición...</Typography>
            </Box>
        );
    }
    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!editableRoutine) return null;

    return (
        <Container component="main" maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
            
            <Typography variant="h4" component="h1" color="primary" align="center" sx={{ mb: 1, fontWeight: 700 }}>
                Editar Rutina
            </Typography>
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
                {originalRoutineName}
            </Typography>

            {/* Edición del Nombre de la Rutina */}
            <Card sx={{ p: 3, mb: 4, boxShadow: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Nombre de la Rutina:</Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={editableRoutine.name}
                    onChange={handleNameChange}
                />
            </Card>

            {/* Lista de Ejercicios Editables */}
            <Typography variant="h5" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 3, color: 'text.primary' }}>
                Ejercicios
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {editableRoutine.workout.exercises.map((exercise, index) => (
                    <Card 
                        key={index} 
                        sx={{ 
                            p: 3, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            boxShadow: 2, 
                            borderLeft: '4px solid', 
                            borderColor: 'secondary.main' 
                        }}
                    >
                        
                        {/* Nombre del Ejercicio */}
                        <TextField
                            fullWidth
                            label="Nombre del Ejercicio"
                            variant="outlined"
                            size="small"
                            sx={{ mb: 2 }}
                            value={exercise.name}
                            onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FitnessCenterIcon color="primary" />
                                    </InputAdornment>
                                ),
                                style: { fontWeight: 'bold' }
                            }}
                        />
                        
                        {/* Sets, Reps y Botón de Eliminar */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                            
                            {/* Sets */}
                            <TextField
                                label="Sets"
                                type="number"
                                size="small"
                                sx={{ width: 100 }}
                                value={exercise.sets}
                                onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                            />
                            
                            {/* Reps */}
                            <TextField
                                label="Reps"
                                type="number"
                                size="small"
                                sx={{ width: 100 }}
                                value={exercise.reps}
                                onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                            />

                            {/* Botón de Eliminar */}
                            <IconButton 
                                color="error"
                                onClick={() => handleRemoveExercise(index)} 
                                aria-label="quitar ejercicio"
                                sx={{ ml: 'auto' }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>

                        {/* Notas */}
                        <TextField
                            fullWidth
                            label="Notas (Opcional)"
                            variant="outlined"
                            size="small"
                            placeholder="Ej: Descanso 90s, superserie con..."
                            value={exercise.notes || ''}
                            onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                        />
                    </Card>
                ))}
            </Box>

            {/* Controles para Añadir y Guardar */}
            <Box sx={{ mt: 5, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddExercise} 
                >
                    Añadir Ejercicio
                </Button>
                <Button 
                    variant="contained" 
                    color="success" // Usamos 'success' para el guardado
                    startIcon={<SaveIcon />}
                    onClick={handleSaveChanges} 
                >
                    Guardar Cambios
                </Button>
            </Box>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                    variant="outlined" 
                    color="inherit" // Color por defecto o secundario
                    onClick={() => navigate('/routines')} 
                >
                    Cancelar y Volver
                </Button>
            </Box>
        </Container>
    );
};

export default RoutineEditPage;