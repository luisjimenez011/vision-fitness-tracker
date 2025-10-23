import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper, 
    Grid,
    Divider,
    useTheme,
    Stack // ⭐️ IMPORTACIÓN AÑADIDA
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save'; 
import RefreshIcon from '@mui/icons-material/Refresh'; 

// =========================================================================
// 1. DEFINICIÓN DEL SUBCOMPONENTE ExerciseRow 
// (Este ya es responsivo internamente gracias a Grid item xs={6})
// =========================================================================

/**
 * Fila editable para un solo ejercicio.
 */
const ExerciseRow = React.memo(({ exercise, dayIndex, exerciseIndex, handleExerciseChange }) => {
    const theme = useTheme();

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                mb: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' 
            }}
        >
            {/* Nombre del Ejercicio */}
            <TextField
                label="Ejercicio"
                variant="standard"
                fullWidth
                value={exercise.name}
                onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'name', e.target.value)}
                sx={{ mb: 1 }}
                InputProps={{
                    style: { fontSize: '1.1rem', fontWeight: 500, color: theme.palette.text.primary }
                }}
            />
            
            {/* ⭐️ RESPONSIVO: Sets y Reps se dividen 50/50 en cualquier pantalla (xs=6) ⭐️ */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Sets */}
                <Grid item xs={6}>
                    <TextField
                        label="Sets"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={exercise.sets}
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
                            onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'notes', e.target.value)}
                        />
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
});
ExerciseRow.displayName = 'ExerciseRow';


// =========================================================================
// 2. COMPONENTE PRINCIPAL: RoutineDisplay
// =========================================================================

const RoutineDisplay = ({ routineData, onSave, onGenerateNew }) => {
    const [editableRoutine, setEditableRoutine] = useState(routineData);
    const theme = useTheme();

    useEffect(() => {
        setEditableRoutine(routineData);
    }, [routineData]);

    const handleRoutineNameChange = (e) => {
        setEditableRoutine({ ...editableRoutine, name: e.target.value });
    };

    const handleExerciseChange = (dayIndex, exerciseIndex, field, value) => {
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
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, bgcolor: theme.palette.background.paper }}>
            
            {/* ⭐️ ENCABEZADO Y BOTONES (Responsivo) ⭐️ */}
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} // ⭐️ Apilar en móvil, en línea en desktop ⭐️
                spacing={{ xs: 2, sm: 1 }}
                justifyContent="space-between" 
                alignItems={{ xs: 'stretch', sm: 'flex-end' }} // Estirar en móvil, alinear al final en desktop
                mb={3}
            >
                {/* Campo de Nombre */}
                <TextField
                    label="Nombre de la Rutina"
                    variant="standard"
                    value={editableRoutine.name}
                    onChange={handleRoutineNameChange}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        // Reducir ligeramente el tamaño de fuente en móvil
                        style: { fontSize: theme.breakpoints.down('sm') ? '1.5rem' : '1.8rem', fontWeight: 'bold' }
                    }}
                />

                {/* Contenedor de Botones */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        // Los botones ocupan todo el ancho en móvil, o se adaptan en desktop
                        width: { xs: '100%', sm: 'auto' } 
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onSave(editableRoutine)}
                        startIcon={<SaveIcon />}
                        sx={{ flexGrow: { xs: 1, sm: 0 } }} // Botón ancho completo en móvil
                    >
                        Guardar
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onGenerateNew}
                        startIcon={<RefreshIcon />}
                        sx={{ flexGrow: { xs: 1, sm: 0 } }} // Botón ancho completo en móvil
                    >
                        Generar Nuevo
                    </Button>
                </Box>
            </Stack>
            
            <Divider sx={{ mb: 4 }} />

            {/* Descripción general */}
            {editableRoutine.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontStyle: 'italic' }}>
                    {editableRoutine.description}
                </Typography>
            )}

            {/* ⭐️ DÍAS DE ENTRENAMIENTO (Estrategia Grid ya implementada) ⭐️ */}
            <Grid container spacing={4}>
                {editableRoutine.workouts.map((day, dayIndex) => (
                    // Ocupa 12 en móvil, 6 en tablet, 4 en desktop. ¡Perfecto!
                    <Grid item xs={12} md={6} lg={4} key={dayIndex}>
                        <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 0.5, color: 'primary.main' }}>
                                {day.day}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
                                Foco: {day.focus}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Box>
                                {/* Ejercicios */}
                                {day.exercises.map((exercise, exerciseIndex) => (
                                    <ExerciseRow 
                                        key={exerciseIndex}
                                        exercise={exercise}
                                        dayIndex={dayIndex}
                                        exerciseIndex={exerciseIndex}
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