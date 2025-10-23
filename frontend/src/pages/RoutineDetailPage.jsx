import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ⬇️ IMPORTACIONES DE MUI
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
    Stack // ⭐️ Añadimos Stack para los Chips
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; 
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// ----------------------------------------------------
// Componente auxiliar para renderizar la tarjeta de un día (ACTUALIZADO CON RESPONSIVIDAD)
// ----------------------------------------------------
const DayCard = ({ dayName, exercises }) => {
    // Estado para controlar si el desplegable está abierto o cerrado
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
            {/* Encabezado Clicable para Alternar el Despliegue */}
            <Box 
                onClick={handleClick} 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mb: open ? { xs: 1.5, sm: 2 } : 0, // Margen responsivo
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
                            // ⭐️ Tamaño de fuente responsivo para el título de la rutina
                            fontSize: { xs: '1.2rem', sm: '1.5rem' }, 
                            // Ocultar si hay desbordamiento en móvil
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {dayName}
                    </Typography>
                </Box>
                
                {/* Ícono de Despliegue */}
                <IconButton size="small" color="primary" sx={{ ml: 1, flexShrink: 0 }}>
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </Box>

            {/* Contenido que se Despliega/Colapsa */}
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ mt: 2 }}>
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
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                                                {index + 1}. {exercise.name || 'Ejercicio Desconocido'}
                                            </Typography>
                                        }
                                        secondary={
                                            // ⭐️ Usamos Stack para gestionar la distribución de los Chips
                                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                                <Chip 
                                                    label={`Sets: ${exercise.sets || 'N/A'}`} 
                                                    size="small" 
                                                    color="primary" 
                                                    variant="outlined" 
                                                />
                                                <Chip 
                                                    label={`Reps: ${exercise.reps || 'N/A'}`} 
                                                    size="small" 
                                                    color="secondary" 
                                                    variant="outlined" 
                                                />
                                                {(exercise.notes && exercise.notes !== '') && (
                                                    <Chip
                                                        label={`Notas: ${exercise.notes}`}
                                                        size="small"
                                                        color="info"
                                                        variant="outlined"
                                                        sx={{ 
                                                            mt: { xs: 1, sm: 0 }, // Un poco de margen superior en móvil si se envuelve
                                                            maxWidth: '100%', 
                                                            // Truncar la nota si es muy larga
                                                            '& .MuiChip-label': {
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                maxWidth: { xs: '150px', sm: '300px' } 
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        }
                                    />
                                </ListItem>
                                {index < exercises.length - 1 && <Divider component="li" variant="fullWidth" sx={{ borderStyle: 'dashed', borderColor: 'text.disabled' }} />}
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
// ----------------------------------------------------
const RoutineDetailPage = () => {
    const { routineId } = useParams();
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ... (Lógica de useEffect y manejo de estados se mantiene igual)

    useEffect(() => {
        const fetchRoutineDetail = async () => {
          try {
            setLoading(true);
            const response = await apiClient.get(`/routine/${routineId}`);
            
            const routineData = response.data;
            
            let planJson = routineData.plan_json;
            if (typeof planJson === 'string') {
              planJson = JSON.parse(planJson);
            }
            routineData.plan_json = planJson;
            
            setRoutine(routineData);
            setError(null);
          } catch (err) {
            setError('Error al cargar los detalles de la rutina.');
            console.error(err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchRoutineDetail();
      }, [routineId]);

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <CircularProgress color="primary" />
                <Typography sx={{ mt: 2 }} color="text.secondary">Cargando...</Typography>
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
                <Alert severity="warning">No se encontró el plan de la rutina.</Alert>
            </Box>
        );
    }
    
    const workoutsArray = routine.plan_json.workouts || []; 
    
    if (!Array.isArray(workoutsArray) || workoutsArray.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Alert severity="info">No se encontraron sesiones de entrenamiento en esta rutina.</Alert>
            </Box>
        );
    }

    return (
        <Container component="main" maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
            
            <Typography 
                variant="h3" 
                component="h1" 
                color="primary" 
                align="center" 
                sx={{ 
                    mb: 1, 
                    fontWeight: 700,
                    // ⭐️ Título más pequeño en móvil
                    fontSize: { xs: '2rem', sm: '3rem' } 
                }}
            >
                {routine.name}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', mb: 4, px: { xs: 2, sm: 0 } }}>
                <DescriptionIcon sx={{ mr: 1, mt: 0.5, color: 'text.secondary', flexShrink: 0 }} />
                <Typography variant="body1" align="center" color="text.secondary">
                    {routine.plan_json.description || 'Rutina personalizada.'}
                </Typography>
            </Box>
            
            {/* Contenedor de las tarjetas de los días */}
            <Box>
                {workoutsArray.map((dayDetails, index) => (
                    // Aseguramos que la primera tarjeta esté abierta por defecto
                    <DayCard 
                        key={index} 
                        dayName={dayDetails.day || `Día ${index + 1}`} 
                        exercises={dayDetails.exercises} 
                    />
                ))}
            </Box>
            
            <Divider sx={{ my: 4 }} />
            <Box textAlign="center">
                <Typography variant="caption" color="text.disabled">
                    Rutina generada por IA. Consulta a un profesional antes de comenzar cualquier nuevo programa de ejercicios.
                </Typography>
            </Box>
        </Container>
    );
};

export default RoutineDetailPage;