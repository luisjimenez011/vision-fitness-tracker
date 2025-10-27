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
    Stack
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save'; 
import RefreshIcon from '@mui/icons-material/Refresh'; 

// =========================================================================
// 1. DEFINICIÓN DEL SUBCOMPONENTE ExerciseRow
// =========================================================================

/**
 * Fila editable para un solo ejercicio dentro de un día de entrenamiento.
 * Utiliza React.memo para optimizar la re-renderización.
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
            {/* Campo para el Nombre del Ejercicio */}
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
            
            {/* Contenedor responsivo para Sets y Repeticiones */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Sets (ocupa la mitad del ancho) */}
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
                {/* Reps (ocupa la mitad del ancho) */}
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
                {/* Notas (opcional, ocupa todo el ancho) */}
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

/**
 * Muestra y permite la edición de la rutina de entrenamiento.
 * @param {object} props.routineData - Objeto de la rutina actual.
 * @param {function} props.onSave - Callback al guardar la rutina.
 * @param {function} props.onGenerateNew - Callback al generar una nueva rutina.
 */
const RoutineDisplay = ({ routineData, onSave, onGenerateNew }) => {
    const [editableRoutine, setEditableRoutine] = useState(routineData);
    const theme = useTheme();

    // Sincroniza el estado editable con la prop 'routineData' cuando esta cambie
    useEffect(() => {
        setEditableRoutine(routineData);
    }, [routineData]);

    const handleRoutineNameChange = (e) => {
        setEditableRoutine({ ...editableRoutine, name: e.target.value });
    };

    /**
     * Maneja los cambios en cualquier campo de un ejercicio.
     */
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
            
            {/* ENCABEZADO Y BOTONES: Utiliza Stack para control de diseño responsivo */}
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} // Apilar en pantallas pequeñas, en línea en medianas y grandes
                spacing={{ xs: 2, sm: 1 }}
                justifyContent="space-between" 
                alignItems={{ xs: 'stretch', sm: 'flex-end' }} // Estirar el alineamiento en móvil
                mb={3}
            >
                {/* Campo de Nombre de la Rutina */}
                <TextField
                    label="Nombre de la Rutina"
                    variant="standard"
                    value={editableRoutine.name}
                    onChange={handleRoutineNameChange}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        style: { fontSize: theme.breakpoints.down('sm') ? '1.5rem' : '1.8rem', fontWeight: 'bold' }
                    }}
                />

                {/* Contenedor de Botones de Acción */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        width: { xs: '100%', sm: 'auto' } // Ancho completo en móvil
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => onSave(editableRoutine)}
                        startIcon={<SaveIcon />}
                        sx={{ flexGrow: { xs: 1, sm: 0 } }} 
                    >
                        Guardar
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onGenerateNew}
                        startIcon={<RefreshIcon />}
                        sx={{ flexGrow: { xs: 1, sm: 0 } }}
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

            {/* DÍAS DE ENTRENAMIENTO: Uso de Grid para layout responsivo de las columnas */}
            <Grid container spacing={4}>
                {editableRoutine.workouts.map((day, dayIndex) => (
                    // Ocupa 12/12 en móvil, 6/12 en tablet, 4/12 en desktop
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
                                {/* Mapeo de los ejercicios para este día */}
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