import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';


import {
    Container,
    Box,
    Typography,
    Card,
    TextField,
    Button,
    CircularProgress,
    Alert,
    InputAdornment, 
    Grid, 
    Stack 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

/**
 * Componente para la edición detallada de una rutina guardada.
 * Permite modificar el nombre de la rutina y los ejercicios (nombre, sets, reps, notas).
 */
const RoutineEditPage = () => {
    const { routineId } = useParams();
    const navigate = useNavigate();

    const [editableRoutine, setEditableRoutine] = useState(null);
    const [originalRoutineName, setOriginalRoutineName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bandera para determinar si es móvil (para el botón Eliminar)
    // En un entorno de producción, se usaría useTheme y useMediaQuery
    const isMobile = window.innerWidth < 600;

    // --- LÓGICA DE CARGA DE DATOS ---
    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                const response = await apiClient.get(`/routine/${routineId}`);
                const routineData = response.data;
                
                // Asume que solo se edita el primer workout (Día 1)
                const workout = routineData.plan_json?.workouts?.[0];

                if (!workout) {
                    setError('Estructura de rutina inválida para edición. Asegúrate de que tenga al menos un entrenamiento.');
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
                setError('No se pudo cargar la rutina para edición. Verifica la conexión o la ID.');
                setLoading(false);
            }
        };

        fetchRoutine();
    }, [routineId]);

    // --- LÓGICA DE MANEJO DE CAMBIOS ---

    const handleNameChange = (e) => {
        setEditableRoutine(prev => ({ ...prev, name: e.target.value }));
    };

    /**
     * Actualiza un campo específico de un ejercicio.
     */
    const handleExerciseChange = (index, field, value) => {
        setEditableRoutine(prev => {
            const newExercises = [...prev.workout.exercises];
            // Asegura que sets y reps sean números enteros o cadena vacía
            const parsedValue = field === 'sets' || field === 'reps' ? parseInt(value, 10) || '' : value;

            newExercises[index] = {
                ...newExercises[index],
                [field]: parsedValue
            };
            return { ...prev, workout: { ...prev.workout, exercises: newExercises } };
        });
    };

    /**
     * Elimina un ejercicio de la lista.
     */
    const handleRemoveExercise = (index) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
            setEditableRoutine(prev => {
                const newExercises = prev.workout.exercises.filter((_, i) => i !== index);
                return { ...prev, workout: { ...prev.workout, exercises: newExercises } };
            });
        }
    };

    /**
     * Añade un nuevo ejercicio predeterminado a la lista.
     */
    const handleAddExercise = () => {
        setEditableRoutine(prev => {
            const newExercises = [
                ...prev.workout.exercises,
                { name: 'Nuevo Ejercicio', sets: 3, reps: 10, notes: '' } // Valores predeterminados
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
            // Reconstruye la estructura completa del plan_json para el PUT
            const updatedPlanJson = {
                workouts: [{ 
                    day: editableRoutine.workout.day,
                    focus: editableRoutine.workout.focus,
                    description: editableRoutine.workout.description || 'Sesión de entrenamiento individual modificada.',
                    exercises: editableRoutine.workout.exercises,
                }]
            };
            
            const payload = {
                name: editableRoutine.name,
                plan_json: updatedPlanJson, 
            };
            
            await apiClient.put(`/routine/${routineId}`, payload);

            alert('Rutina actualizada con éxito!');
            navigate('/routines');

        } catch (err) {
            console.error('Error saving routine:', err.response?.data || err.message);
            alert(`Error al guardar la rutina: ${err.response?.data?.error || 'Error de servidor'}`);
        }
    };


    // --- Renderizado Condicional ---

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 5 }}>
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
            
            {/* Título Principal */}
            <Typography 
                variant="h4" 
                component="h1" 
                color="primary" 
                align="center" 
                sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
            >
                Editar Rutina
            </Typography>
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {originalRoutineName}
            </Typography>

            {/* Edición del Nombre de la Rutina */}
            <Card sx={{ p: { xs: 2, sm: 3 }, mb: 4, boxShadow: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Nombre de la Rutina:</Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={editableRoutine.name}
                    onChange={handleNameChange}
                    placeholder="Escribe un nombre memorable para tu rutina"
                />
            </Card>

            {/* Sección de Ejercicios */}
            <Typography variant="h5" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 3, color: 'text.primary' }}>
                Ejercicios
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {editableRoutine.workout.exercises.map((exercise, index) => (
                    <Card 
                        key={index} 
                        sx={{ 
                            p: { xs: 2, sm: 3 }, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            boxShadow: 2, 
                            borderLeft: '4px solid', 
                            borderColor: 'secondary.main' 
                        }}
                    >
                        
                        {/* 1. Nombre del Ejercicio */}
                        <TextField
                            fullWidth
                            label={`Ejercicio ${index + 1}`}
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
                        
                        {/* 2. Sets, Reps y Botón de Eliminar (Responsivo con Grid) */}
                        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            
                            {/* Sets */}
                            <Grid item xs={6} sm={4}> 
                                <TextField
                                    label="Sets"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={exercise.sets}
                                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            
                            {/* Reps */}
                            <Grid item xs={6} sm={4}>
                                <TextField
                                    label="Reps"
                                    type="number"
                                    size="small"
                                    fullWidth
                                    value={exercise.reps}
                                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>

                            {/* Botón de Eliminar */}
                            <Grid 
                                item 
                                xs={12} 
                                sm={4} 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: { xs: 'flex-start', sm: 'flex-end' } 
                                }}
                            >
                                <Button 
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleRemoveExercise(index)} 
                                    startIcon={<DeleteIcon />}
                                    size="small"
                                    // Usa la variable isMobile para decidir si es fullWidth
                                    fullWidth={isMobile} 
                                >
                                    Eliminar
                                </Button>
                            </Grid>
                        </Grid>

                        {/* 3. Notas */}
                        <TextField
                            fullWidth
                            label="Notas (Opcional)"
                            variant="outlined"
                            size="small"
                            multiline
                            maxRows={3}
                            placeholder="Ej: Descanso 90s, superserie con..."
                            value={exercise.notes || ''}
                            onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                        />
                    </Card>
                ))}
            </Box>

            {/* Controles: Añadir y Guardar (Responsivo con Stack) */}
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                sx={{ mt: 5, justifyContent: 'center' }}
            >
                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddExercise} 
                    sx={{ flexGrow: { xs: 1, sm: 0 } }} 
                >
                    Añadir Ejercicio
                </Button>
                <Button 
                    variant="contained" 
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveChanges} 
                    sx={{ flexGrow: { xs: 1, sm: 0 } }} 
                >
                    Guardar Cambios
                </Button>
            </Stack>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                    variant="outlined" 
                    color="inherit"
                    onClick={() => navigate('/routines')} 
                >
                    Cancelar y Volver
                </Button>
            </Box>
        </Container>
    );
};

export default RoutineEditPage;