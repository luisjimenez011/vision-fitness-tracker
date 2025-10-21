import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ⬇️ IMPORTACIONES DE MUI
import { 
    Container, 
    Box, 
    Typography, 
    Card, 
    Button, 
    CircularProgress, 
    Alert,
    TextField,
    IconButton,
    InputAdornment,
    Switch,
    FormControlLabel,
    List,
    ListItem,
    Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';


// ----------------------------------------------------
// COMPONENTE MessageToast (Migrado a MUI Alert/Snackbar)
// ----------------------------------------------------
// En una aplicación MUI real, usarías el componente Snackbar y Alert. 
// Aquí lo simplificamos a una Alert que desaparece, manteniendo la funcionalidad original.
const MessageAlert = ({ message, type, onClose }) => {
    if (!message) return null;

    return (
        <Alert 
            severity={type === 'error' ? 'error' : 'success'} 
            onClose={onClose}
            variant="filled"
            sx={{ 
                position: 'fixed', 
                top: 20, 
                right: 20, 
                zIndex: 1000,
                minWidth: '300px'
            }}
        >
            {message}
        </Alert>
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
    
    const [inputs, setInputs] = useState({}); 
    const [isBodyweightMode, setIsBodyweightMode] = useState({}); 
    
    const [message, setMessage] = useState({ text: null, type: null });
    const [loading, setLoading] = useState(true);

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
            } finally {
                setLoading(false);
            }
        };

        fetchRoutine();
    }, [routineId]);

    // Lógica del Cronómetro (Sin cambios)
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

    // Manejador genérico de inputs para la nueva serie (Sin cambios)
    const handleInputChange = (exerciseName, field, value) => {
        setInputs((prev) => ({
            ...prev,
            [exerciseName]: {
                ...prev[exerciseName],
                [field]: value,
            },
        }));
    };

    // Función auxiliar para re-numerar las series (Sin cambios)
    const reindexSets = (sets) => {
        const indexedSets = [];
        const exerciseSetCounts = {};

        sets.forEach(set => {
            const name = set.exerciseName;
            exerciseSetCounts[name] = (exerciseSetCounts[name] || 0) + 1;
            indexedSets.push({
                ...set,
                set: exerciseSetCounts[name]
            });
        });
        return indexedSets;
    };
    
    // Función para obtener el índice real del set (Sin cambios)
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

    // Lógica para añadir una nueva serie (Sin cambios en la lógica central, solo validación adaptada)
    const handleAddSet = (exerciseName) => {
        if (!isRunning) {
            showMessage('Debes iniciar el cronómetro para registrar sets.', 'error');
            return;
        }
        
        const isBodyweight = isBodyweightMode[exerciseName] || false;

        let { weight, reps } = inputs[exerciseName] || { weight: '', reps: '' };
        
        // Validación de Reps
        if (!/^\d+$/.test(reps) || parseInt(reps, 10) <= 0) {
            showMessage('Introduce solo un valor numérico válido (> 0) para Repeticiones.', 'error');
            return;
        }
        
        // Validación de Peso
        if (!isBodyweight) {
            if (!/^\d+(\.\d+)?$/.test(weight) || parseFloat(weight) < 0) {
                showMessage('Introduce un valor numérico válido (>= 0) para Peso.', 'error');
                return;
            }
        } else {
            weight = 0;
        }

        const newSet = {
            exerciseName,
            set: 0, 
            weight: parseFloat(weight), 
            reps: parseInt(reps, 10),
            isBodyweight: isBodyweight,
            timestamp: new Date().toISOString() 
        };

        setTrackedSets((prev) => {
            const newSets = [...prev, newSet];
            return reindexSets(newSets);
        });
        
        showMessage(`Set registrado.`, 'success');
        
        // Limpiamos los inputs
        setInputs((prev) => ({
            ...prev,
            [exerciseName]: { weight: isBodyweight ? '' : '', reps: '' },
        }));
    };
    
    // Actualiza el peso o las reps de un set (Sin cambios)
    const handleUpdateSet = (index, field, value) => {
        
        if (field === 'reps' && !/^\d*$/.test(value)) return;
        if (field === 'weight' && !/^\d*(\.\d*)?$/.test(value)) return;
        
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

    // Elimina un set (Sin cambios)
    const handleRemoveSet = (index, setNumber, exerciseName) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el Set ${setNumber} de ${exerciseName}?`)) {
            return;
        }

        setTrackedSets(prevSets => {
            const newSets = prevSets.filter((_, i) => i !== index);
            showMessage('Set eliminado.', 'success');
            return reindexSets(newSets); 
        });
    };


    // Lógica para finalizar el entrenamiento (Sin cambios)
    const handleFinishWorkout = async () => {
        if (timer === 0) {
            showMessage('El entrenamiento no ha comenzado.', 'error');
            return;
        }

        if (trackedSets.length === 0 && !window.confirm('No has registrado sets. ¿Seguro que quieres finalizar el entrenamiento sin guardar progreso?')) {
            return;
        }
        
        setIsRunning(false);
        
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

    // Función para formatear el tiempo (Sin cambios)
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Cargando rutina...</Typography>
            </Box>
        );
    }
    
    if (!routine) {
        return (
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Alert severity="error">Error al cargar la rutina.</Alert>
            </Container>
        );
    }


    return (
        <Container component="main" maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
            <MessageAlert 
                message={message.text} 
                type={message.type} 
                onClose={() => setMessage({ text: null, type: null })}
            />

            <Typography variant="h4" component="h1" color="primary" align="center" sx={{ mb: 1, fontWeight: 700 }}>
                {routine.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
                {currentDayWorkout?.day || 'Día Desconocido'}: {currentDayWorkout?.focus || 'Entrenamiento del día'}
            </Typography>

            {/* Sección del Cronómetro y Controles */}
            <Box sx={{ 
                textAlign: 'center', 
                margin: '30px 0', 
                p: 3, 
                bgcolor: 'primary.light', // Color de fondo suave
                borderRadius: 2,
                boxShadow: 3
            }}>
                <Typography 
                    variant="h2" 
                    component="div"
                    sx={{ 
                        fontWeight: '900', 
                        color: 'primary.dark', 
                        fontFamily: 'monospace',
                        mb: 2
                    }}
                >
                    {formatTime(timer)}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        color={isRunning ? 'warning' : 'success'}
                        startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                        onClick={() => setIsRunning(!isRunning)} 
                        size="large"
                    >
                        {isRunning ? 'Pausar' : (timer === 0 ? 'Empezar' : 'Continuar')}
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={handleFinishWorkout} 
                        disabled={timer === 0}
                        size="large"
                    >
                        Finalizar
                    </Button>
                </Box>
            </Box>

            {/* Lista de Ejercicios */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {currentDayWorkout?.exercises?.map((exercise, index) => (
                    <Card key={index} sx={{ p: 3, boxShadow: 3 }}>
                        
                        <Typography variant="h5" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 1, color: 'text.primary' }}>
                            <FitnessCenterIcon sx={{ mr: 1, verticalAlign: 'middle' }} color="primary" />
                            {exercise.name}
                        </Typography>
                        
                        <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Plan: {exercise.sets} sets x {exercise.reps} reps
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Notas: {exercise.notes || 'N/A'}
                        </Typography>

                        {/* Sets registrados */}
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Progreso ({trackedSets.filter((s) => s.exerciseName === exercise.name).length} / {exercise.sets}):
                            </Typography>
                            <List disablePadding>
                                {trackedSets
                                    .filter((s) => s.exerciseName === exercise.name)
                                    .map((s, idx) => {
                                        const globalIndex = getGlobalSetIndex(s.exerciseName, s.set); 
                                        const isSetBodyweight = s.isBodyweight || false;

                                        return (
                                            <React.Fragment key={s.timestamp + s.set}>
                                                <ListItem 
                                                    sx={{ 
                                                        py: 1, 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                                        <Typography sx={{ fontWeight: 'medium', mr: 2 }}>
                                                            Set {s.set}:
                                                        </Typography>
                                                        
                                                        <Typography 
                                                            variant="caption"
                                                            sx={{ 
                                                                mr: 1, 
                                                                color: isSetBodyweight ? 'success.main' : 'inherit', 
                                                                fontWeight: 'bold' 
                                                            }}
                                                        >
                                                            {isSetBodyweight ? 'BW' : ''}
                                                        </Typography>

                                                        {/* Input editable para Peso */}
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            label={isSetBodyweight ? '' : 'Peso'}
                                                            variant="outlined"
                                                            value={s.weight || ''}
                                                            onChange={(e) => handleUpdateSet(globalIndex, 'weight', e.target.value)}
                                                            sx={{ width: 80, mr: 1 }}
                                                            disabled={isSetBodyweight}
                                                        /> 
                                                        {!isSetBodyweight && <Typography sx={{ mr: 1 }}>kg x</Typography>}
                                                        
                                                        {/* Input editable para Reps */}
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            label="Reps"
                                                            variant="outlined"
                                                            value={s.reps}
                                                            onChange={(e) => handleUpdateSet(globalIndex, 'reps', e.target.value)}
                                                            sx={{ width: 80 }}
                                                        /> 
                                                    </Box>
                                                    
                                                    {/* Botón de Eliminar */}
                                                    <IconButton 
                                                        color="error"
                                                        onClick={() => handleRemoveSet(globalIndex, s.set, s.exerciseName)} 
                                                        aria-label="eliminar set"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </ListItem>
                                                {idx < trackedSets.filter((s) => s.exerciseName === exercise.name).length - 1 && <Divider component="li" />}
                                            </React.Fragment>
                                        );
                                    })}
                            </List>
                        </Box>

                        {/* Formulario para nuevo set */}
                        <Box sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'grey.300', borderRadius: 1 }}>
                            
                            {/* Switch de Peso Corporal (BW) */}
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={isBodyweightMode[exercise.name] || false}
                                        onChange={(e) => {
                                            setIsBodyweightMode(prev => ({ 
                                                ...prev, 
                                                [exercise.name]: e.target.checked 
                                            }));
                                            if(e.target.checked) {
                                                setInputs(prev => ({
                                                    ...prev,
                                                    [exercise.name]: { ...prev[exercise.name], weight: '' }
                                                }));
                                            }
                                        }}
                                        color="secondary"
                                    />
                                }
                                label="Sin peso adicional (Calistenia)"
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                {/* Input de Peso */}
                                <TextField
                                    type="number"
                                    label="Peso (kg)"
                                    size="small"
                                    fullWidth
                                    value={inputs[exercise.name]?.weight || ''}
                                    onChange={(e) => handleInputChange(exercise.name, 'weight', e.target.value)}
                                    disabled={isBodyweightMode[exercise.name]}
                                />
                                {/* Input de Reps */}
                                <TextField
                                    type="number"
                                    label="Reps"
                                    size="small"
                                    fullWidth
                                    value={inputs[exercise.name]?.reps || ''}
                                    onChange={(e) => handleInputChange(exercise.name, 'reps', e.target.value)}
                                />
                                {/* Botón Añadir Set */}
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => handleAddSet(exercise.name)}
                                    startIcon={<AddIcon />}
                                    sx={{ minWidth: 120 }}
                                    disabled={!isRunning}
                                >
                                    Añadir
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                ))}
            </Box>
        </Container>
    );
};

export default TrackingPage;