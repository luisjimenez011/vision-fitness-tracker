import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Grid,
    Divider,
    useTheme 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save'; 
import RefreshIcon from '@mui/icons-material/Refresh'; 

// =========================================================================
// 1. DEFINICIÓN DEL SUBCOMPONENTE ExerciseRow (FUERA DEL COMPONENTE PRINCIPAL)
//    Esto evita la pérdida de foco al actualizar el estado.
// =========================================================================

/**
 * Fila editable para un solo ejercicio.
 * Se define fuera de RoutineDisplay para optimizar el rendimiento.
 */
const ExerciseRow = ({ exercise, dayIndex, exerciseIndex, handleExerciseChange }) => {
    const theme = useTheme();

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                mb: 2, 
                // Color de fondo sutil que respeta el modo oscuro/claro
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' 
            }}
        >
            {/* Nombre del Ejercicio (TextField para input) */}
            <TextField
                label="Ejercicio"
                variant="standard"
                fullWidth
                value={exercise.name}
                // Handler pasado por props
                onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'name', e.target.value)}
                sx={{ mb: 1 }}
                InputProps={{
                    style: { fontSize: '1.1rem', fontWeight: 500, color: theme.palette.text.primary }
                }}
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Sets */}
                <Grid item xs={6}>
                    <TextField
                        label="Sets"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={exercise.sets}
                        // Handler pasado por props
                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'sets', e.target.value)}
                    />
                </Grid>
                {/* Reps */}
                <Grid item xs={6}>
                    <TextField
                        label="Repeticiones"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={exercise.reps}
                        // Handler pasado por props
                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'reps', e.target.value)}
                    />
                </Grid>
                {/* Notas (Opcional) */}
                {exercise.notes !== undefined && (
                     <Grid item xs={12}>
                        <TextField
                            label="Notas"
                            variant="outlined"
                            size="small"
                            fullWidth
                            multiline
                            maxRows={2}
                            value={exercise.notes || ''}
                            // Handler pasado por props
                            onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'notes', e.target.value)}
                        />
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};


// =========================================================================
// 2. COMPONENTE PRINCIPAL: RoutineDisplay
// =========================================================================

/**
 * @typedef {object} Exercise
 * @property {string} name
 * @property {string} sets
 * @property {string} reps
 * @property {string} [notes]
 */

/**
 * @typedef {object} DayWorkout
 * @property {string} day
 * @property {string} focus
 * @property {Exercise[]} exercises
 */

/**
 * @typedef {object} RoutineData
 * @property {string} name // Nombre de la rutina
 * @property {DayWorkout[]} workouts // Días de entrenamiento
 * @property {string} [description]
 */

/**
 * Componente que muestra y permite editar una rutina de entrenamiento.
 * Migrado a Material-UI.
 * * @param {{
 * routineData: RoutineData;
 * onSave: (updatedRoutine: RoutineData) => void;
 * onGenerateNew: () => void;
 * }} props
 */
const RoutineDisplay = ({ routineData, onSave, onGenerateNew }) => {
    // Usamos la prop como valor inicial del estado local para la edición
    const [editableRoutine, setEditableRoutine] = useState(routineData);
    const theme = useTheme();

    useEffect(() => {
        // Sincronizar el estado interno cuando cambian los props externos
        setEditableRoutine(routineData);
    }, [routineData]);

    const handleRoutineNameChange = (e) => {
        setEditableRoutine({ ...editableRoutine, name: e.target.value });
    };

    const handleExerciseChange = (dayIndex, exerciseIndex, field, value) => {
        // Creación inmutable de copias para actualizar el estado
        const updatedWorkouts = [...editableRoutine.workouts];
        updatedWorkouts[dayIndex].exercises[exerciseIndex] = {
            ...updatedWorkouts[dayIndex].exercises[exerciseIndex],
            [field]: value,
        };
        setEditableRoutine({ ...editableRoutine, workouts: updatedWorkouts });
    };

    if (!editableRoutine || !editableRoutine.workouts) {
        return (
            <Typography color="text.secondary" sx={{ p: 3 }}>
                No hay rutina para mostrar o la estructura es inválida.
            </Typography>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 4, bgcolor: theme.palette.background.paper }}>
            {/* Encabezado y Botones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
                <TextField
                    label="Nombre de la Rutina"
                    variant="standard"
                    value={editableRoutine.name}
                    onChange={handleRoutineNameChange}
                    sx={{ flexGrow: 1, mr: 2 }}
                    InputProps={{
                        // Estilos para el nombre de la rutina
                        style: { fontSize: '1.8rem', fontWeight: 'bold', color: theme.palette.text.primary }
                    }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onSave(editableRoutine)}
                        startIcon={<SaveIcon />}
                    >
                        Guardar
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onGenerateNew}
                        startIcon={<RefreshIcon />}
                    >
                        Generar Nuevo
                    </Button>
                </Box>
            </Box>
            
            {/* Descripción general de la rutina */}
            {editableRoutine.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontStyle: 'italic' }}>
                    {editableRoutine.description}
                </Typography>
            )}

            <Divider sx={{ mb: 4 }} />

            {/* Iteración de Días de Entrenamiento */}
            <Grid container spacing={4}>
                {editableRoutine.workouts.map((day, dayIndex) => (
                    // Cada día es una columna en el Grid (ocupa 12 en móvil, 6 en tablet, 4 en desktop)
                    <Grid item xs={12} md={6} lg={4} key={dayIndex}>
                        <Paper elevation={1} sx={{ p: 3 }}>
                            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 0.5, color: 'primary.main' }}>
                                {day.day}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
                                Foco: {day.focus}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ minHeight: '150px' }}>
                                {/* Ejercicios */}
                                {day.exercises.map((exercise, exerciseIndex) => (
                                    <ExerciseRow 
                                        key={exerciseIndex}
                                        exercise={exercise}
                                        dayIndex={dayIndex}
                                        exerciseIndex={exerciseIndex}
                                        // Pasamos la función de manejo de cambios
                                        handleExerciseChange={handleExerciseChange} 
                                    />
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default RoutineDisplay;