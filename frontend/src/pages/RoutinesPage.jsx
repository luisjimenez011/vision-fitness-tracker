import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

// ⬇️ IMPORTACIONES DE MUI (Stack añadido para responsividad)
import { 
    Container, 
    Box, 
    Typography, 
    Card, 
    Button, 
    IconButton, 
    CircularProgress, 
    Alert,
    Stack // ⭐️ Importación clave para gestión de diseño responsivo
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add'; 

const RoutinesPage = () => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Función para cargar las rutinas (mantenida intacta)
    const fetchRoutines = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/routine/my-routines');
            setRoutines(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las rutinas. Por favor, inténtalo de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
        
    useEffect(() => {
        fetchRoutines();
    }, []);

    // 🆕 HANDLER: Navega a la página de detalles de la rutina
    const handleViewDetails = (routineId) => {
        navigate(`/routines/${routineId}`);
    };
    
    // Handlers funcionales (mantenidos intactos)
    const handleStartWorkout = (routineId) => {
        navigate(`/track/${routineId}`);
    };

    const handleEditRoutine = (routineId) => {
        navigate(`/routine/edit/${routineId}`);
    };

    const handleDeleteRoutine = async (routineId, routineName) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar la rutina "${routineName}"? Esta acción es irreversible.`)) {
            return;
        }

        try {
            await apiClient.delete(`/routine/${routineId}`);
            alert('Rutina eliminada con éxito.');
            fetchRoutines(); 
        } catch (err) {
            console.error('Error al eliminar la rutina:', err);
            const errorMessage = err.response?.data?.error || 'Error del servidor al eliminar la rutina.';
            alert(`Error al eliminar: ${errorMessage}`);
        }
    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Cargando...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* Encabezado y Botón (Funciona bien con flex por defecto) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" color="primary" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    Mis Rutinas Guardadas
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/routine/create" 
                    // Reducir tamaño en móvil
                    size={window.innerWidth < 600 ? "small" : "medium"} 
                >
                    Crear Nueva
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {routines.length === 0 ? (
                <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mt: 5 }}>
                    No tienes rutinas guardadas. ¡Crea una ahora!
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                    {routines.map((routine) => (
                        <Card 
                            key={routine.id} 
                            // 🔑 Aplicamos el onClick a toda la tarjeta para ver detalles
                            onClick={() => handleViewDetails(routine.id)}
                            sx={{ 
                                width: '100%',
                                p: { xs: 1.5, sm: 2 }, // Padding responsivo
                                boxShadow: 3,
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-2px)', 
                                    boxShadow: 6,
                                },
                            }}
                        >
                            {/* ⭐️ ESTRUCTURA RESPONSIVA DE LA TARJETA ⭐️ */}
                            <Stack
                                // En móvil (xs) apilamos verticalmente, en tablet/desktop (sm) lo ponemos en fila
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 1.5, sm: 2 }}
                                alignItems={{ xs: 'stretch', sm: 'center' }} // Estiramos en móvil
                                justifyContent="space-between"
                            >
                                {/* Información de la Rutina */}
                                <Box sx={{ flexGrow: 1, minWidth: '150px' }}>
                                    <Typography variant="h5" sx={{ mb: 0.5, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                                        {routine.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Días: {routine.workouts?.length || 'N/A'} | Creada: {new Date(routine.created_at).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                    
                                {/* Contenedor de Botones (Acciones) */}
                                <Box 
                                    // Utilizamos Stack para apilar los botones en móvil o mostrarlos en línea en desktop
                                    component={Stack}
                                    direction={{ xs: 'row' }} // Los botones se quedan en fila, pero ahora el contenedor se estira
                                    spacing={{ xs: 1, sm: 1 }}
                                    justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                                >
                                    {/* Botón de Eliminar (IconButton en móvil para ahorrar espacio) */}
                                    <IconButton 
                                        color="error"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRoutine(routine.id, routine.name); }}
                                        aria-label="eliminar"
                                        size="medium"
                                        sx={{ 
                                            display: { xs: 'block', sm: 'none' } // Solo visible en móvil
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    {/* Botón de Eliminar (Button en desktop) */}
                                    <Button 
                                        variant="outlined"
                                        color="error"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRoutine(routine.id, routine.name); }}
                                        startIcon={<DeleteIcon />}
                                        size="small"
                                        sx={{ 
                                            display: { xs: 'none', sm: 'flex' } // Solo visible en desktop
                                        }}
                                    >
                                        Eliminar
                                    </Button>

                                    {/* Botón de Editar */}
                                    <Button 
                                        variant="outlined" 
                                        color="primary" 
                                        onClick={(e) => { e.stopPropagation(); handleEditRoutine(routine.id); }}
                                        startIcon={<EditIcon />}
                                        size="small"
                                        sx={{ flexGrow: { xs: 1, sm: 0 } }} // Ocupa espacio igual en móvil
                                    >
                                        Editar
                                    </Button>

                                    {/* Botón de Empezar */}
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={(e) => { e.stopPropagation(); handleStartWorkout(routine.id); }}
                                        startIcon={<FitnessCenterIcon />}
                                        size="small"
                                        sx={{ flexGrow: { xs: 1, sm: 0 } }} // Ocupa espacio igual en móvil
                                    >
                                        Empezar
                                    </Button>
                                </Box>
                            </Stack>
                        </Card>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default RoutinesPage;