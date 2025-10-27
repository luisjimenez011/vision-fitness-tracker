import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';


import { 
    Box, 
    Typography, 
    Container, 
    CircularProgress, 
    Alert, 
    Card, 
    List, 
    ListItem, 
    ListItemText,
    Divider,
    Chip,
    Collapse, 
    IconButton,
    Stack 
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; 
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// ----------------------------------------------------
// Componente auxiliar para renderizar la tarjeta de una sesión (DayCard)
// Muestra el título del día y una lista colapsable de ejercicios.
// ----------------------------------------------------
const DayCard = ({ dayName, exercises }) => {
    // Controla si la sección de ejercicios está abierta o cerrada
    const [open, setOpen] = useState(true); 

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <Card 
            sx={{
                p: { xs: 2, sm: 3 }, // Padding responsivo
                mb: 3,
                textAlign: 'left',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'primary.dark',
                boxShadow: 3
            }}
        >
            {/* Encabezado Clicable para alternar Collapse */}
            <Box 
                onClick={handleClick} 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mb: open ? { xs: 1.5, sm: 2 } : 0,
                    cursor: 'pointer' 
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
                    <FitnessCenterIcon color="primary" sx={{ mr: 1, flexShrink: 0 }} />
                    <Typography 
                        variant="h5" 
                        component="h3" 
                        color="primary" 
                        sx={{ 
                            fontWeight: 600,
                            // Tamaño de fuente responsivo
                            fontSize: { xs: '1.2rem', sm: '1.5rem' }, 
                            // Manejo de desbordamiento
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {dayName}
                    </Typography>
                </Box>
                
                {/* Ícono de Despliegue/Colapso */}
                <IconButton size="small" color="primary" sx={{ ml: 1, flexShrink: 0 }}>
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </Box>

            {/* Contenido Colapsable (Lista de Ejercicios) */}
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Divider sx={{ mb: 2, borderStyle: 'dashed', borderColor: 'primary.light' }} /> 
                
                <List disablePadding>
                    {Array.isArray(exercises) && exercises.length > 0 ? (
                        exercises.map((exercise, index) => (
                            <React.Fragment key={index}>
                                <ListItem 
                                    sx={{ 
                                        flexDirection: 'column', 
                                        alignItems: 'flex-start',
                                        py: 1.5
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            // Nombre del ejercicio
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                {index + 1}. **{exercise.name || 'Ejercicio Desconocido'}**
                                            </Typography>
                                        }
                                        secondary={
                                            // Sets, Reps y Notas usando Stack para responsividad
                                            <Stack 
                                                direction="row" 
                                                spacing={{ xs: 1, sm: 1.5 }} 
                                                sx={{ mt: 1, flexWrap: 'wrap', alignItems: 'center' }} 
                                            >
                                                <Chip 
                                                    label={`Sets: ${exercise.sets || 'N/A'}`} 
                                                    size="small" 
                                                    color="primary" 
                                                    variant="filled" 
                                                />
                                                <Chip 
                                                    label={`Reps: ${exercise.reps || 'N/A'}`} 
                                                    size="small" 
                                                    color="secondary" 
                                                    variant="filled" 
                                                />
                                                {(exercise.notes && exercise.notes !== '') && (
                                                    <Chip
                                                        label={`Notas: ${exercise.notes}`}
                                                        size="small"
                                                        color="info"
                                                        variant="outlined"
                                                        sx={{ 
                                                            mt: { xs: 1, sm: 0 }, 
                                                            maxWidth: { xs: '100%', sm: '300px' }, 
                                                            // Truncar nota larga
                                                            '& .MuiChip-label': {
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        }
                                    />
                                </ListItem>
                                {/* Separador visual entre ejercicios */}
                                {index < exercises.length - 1 && <Divider component="li" variant="fullWidth" sx={{ borderStyle: 'dashed', borderColor: 'grey.300' }} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText secondary="No hay ejercicios definidos para este día." />
                        </ListItem>
                    )}
                </List>
            </Collapse>
        </Card>
    );
};

// ----------------------------------------------------
// Componente Principal RoutineDetailPage 
// Muestra el detalle completo de una rutina por ID.
// ----------------------------------------------------
const RoutineDetailPage = () => {
    const { routineId } = useParams();
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lógica para cargar los detalles de la rutina desde el backend
    useEffect(() => {
        const fetchRoutineDetail = async () => {
          try {
            setLoading(true);
            const response = await apiClient.get(`/routine/${routineId}`);
            
            const routineData = response.data;
            
            let planJson = routineData.plan_json;
            // Parsea la cadena JSON si es necesario
            if (typeof planJson === 'string') {
              planJson = JSON.parse(planJson);
            }
            routineData.plan_json = planJson;
            
            setRoutine(routineData);
            setError(null);
          } catch (err) {
            setError('Error al cargar los detalles de la rutina. Verifica la ID.');
            console.error("Error fetching routine detail:", err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchRoutineDetail();
      }, [routineId]);

    // --- Renderizado Condicional: Carga y Errores ---
    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <CircularProgress color="primary" />
                <Typography sx={{ mt: 2 }} color="text.secondary">Cargando detalles de la rutina...</Typography>
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

    if (!routine || !routine.plan_json) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Alert severity="warning">No se encontró el plan de la rutina o la estructura es inválida.</Alert>
            </Box>
        );
    }
    
    // Extrae el array de sesiones de entrenamiento
    const workoutsArray = routine.plan_json.workouts || []; 
    
    if (!Array.isArray(workoutsArray) || workoutsArray.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Alert severity="info">La rutina no tiene sesiones de entrenamiento definidas.</Alert>
            </Container>
        );
    }

    // --- Renderizado Principal de la Rutina ---
    return (
        <Container component="main" maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
            
            {/* Título de la Rutina (Responsivo) */}
            <Typography 
                variant="h3" 
                component="h1" 
                color="primary" 
                align="center" 
                sx={{ 
                    mb: 1, 
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '3rem' } 
                }}
            >
                {routine.name}
            </Typography>
            
            {/* Descripción */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mb: 4, px: { xs: 2, sm: 0 } }}>
                <DescriptionIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary', flexShrink: 0 }} />
                <Typography variant="body1" align="center" color="text.secondary">
                    {routine.plan_json.description || 'Rutina personalizada sin descripción detallada.'}
                </Typography>
            </Box>
            
            {/* Renderizado de las tarjetas DayCard para cada sesión */}
            <Box>
                {workoutsArray.map((dayDetails, index) => (
                    <DayCard 
                        key={index} 
                        // Usa 'day', 'focus' o un nombre genérico como título
                        dayName={dayDetails.day || dayDetails.focus || `Día ${index + 1}`} 
                        exercises={dayDetails.exercises} 
                    />
                ))}
            </Box>
            
            <Divider sx={{ my: 4 }} />
            <Box textAlign="center">
                <Typography variant="caption" color="text.disabled">
                    Rutina generada. **ID**: {routineId}.
                </Typography>
            </Box>
        </Container>
    );
};

export default RoutineDetailPage;