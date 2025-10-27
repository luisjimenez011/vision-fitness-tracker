import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';


import { 
    Container, 
    Box, 
    Typography, 
    Card, 
    Button, 
    IconButton, 
    CircularProgress, 
    Alert,
    Stack 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add'; 

/**
 * Componente de la página que lista todas las rutinas guardadas del usuario.
 * Proporciona opciones para ver detalles, editar, empezar a entrenar y eliminar.
 */
const RoutinesPage = () => {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    /**
     * Carga las rutinas del usuario desde el backend.
     */
    const fetchRoutines = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/routine/my-routines');
            setRoutines(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las rutinas. Por favor, inténtalo de nuevo.');
            console.error('Error fetching routines:', err);
        } finally {
            setLoading(false);
        }
    };
        
    useEffect(() => {
        fetchRoutines();
    }, []);

    /**
     * Navega a la página de detalles de una rutina específica.
     * Asignado al click de la tarjeta.
     * @param {string} routineId - ID de la rutina.
     */
    const handleViewDetails = (routineId) => {
        navigate(`/routines/${routineId}`);
    };
    
    /**
     * Inicia el seguimiento de una sesión de entrenamiento.
     * @param {string} routineId - ID de la rutina.
     */
    const handleStartWorkout = (routineId) => {
        navigate(`/track/${routineId}`);
    };

    /**
     * Navega a la página de edición de la rutina.
     * @param {string} routineId - ID de la rutina.
     */
    const handleEditRoutine = (routineId) => {
        navigate(`/routine/edit/${routineId}`);
    };

    /**
     * Elimina una rutina después de la confirmación del usuario.
     * @param {string} routineId - ID de la rutina.
     * @param {string} routineName - Nombre de la rutina para la confirmación.
     */
    const handleDeleteRoutine = async (routineId, routineName) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar la rutina "${routineName}"? Esta acción es irreversible.`)) {
            return;
        }

        try {
            await apiClient.delete(`/routine/${routineId}`);
            alert('Rutina eliminada con éxito.');
            fetchRoutines(); // Recarga la lista de rutinas
        } catch (err) {
            console.error('Error al eliminar la rutina:', err);
            const errorMessage = err.response?.data?.error || 'Error del servidor al eliminar la rutina.';
            alert(`Error al eliminar: ${errorMessage}`);
        }
    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 5 }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Cargando rutinas...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            
            {/* Encabezado y Botón de Creación */}
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
                    size="medium" // Se mantiene medium, MUI ajustará el tamaño visualmente en móvil
                >
                    Crear Nueva
                </Button>
            </Box>

            {/* Mensajes de Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Lista de Rutinas o Mensaje de Vacío */}
            {routines.length === 0 ? (
                <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mt: 5 }}>
                    No tienes rutinas guardadas. ¡Crea una ahora para empezar!
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                    {routines.map((routine) => (
                        <Card 
                            key={routine.id} 
                            // Permite ver los detalles al hacer click en cualquier parte de la tarjeta
                            onClick={() => handleViewDetails(routine.id)}
                            sx={{ 
                                width: '100%',
                                p: { xs: 1.5, sm: 2 }, 
                                boxShadow: 3,
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-2px)', 
                                    boxShadow: 6,
                                },
                            }}
                        >
                            <Stack
                                // Estructura responsiva: columna en móvil, fila en desktop
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={{ xs: 1.5, sm: 2 }}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                justifyContent="space-between"
                            >
                                {/* Información de la Rutina (Nombre y Metadatos) */}
                                <Box sx={{ flexGrow: 1, minWidth: '150px' }}>
                                    <Typography variant="h5" sx={{ mb: 0.5, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                                        {routine.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Días: {routine.workouts?.length || 'N/A'} | Creada: {new Date(routine.created_at).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                    
                                {/* Contenedor de Botones de Acción */}
                                <Stack
                                    direction={{ xs: 'row' }}
                                    spacing={{ xs: 1, sm: 1 }}
                                    justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
                                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                                >
                                    {/* Botón de Eliminar (Icono en móvil, Botón con texto en desktop) */}
                                    {/* Versión Icono (Móvil) */}
                                    <IconButton 
                                        color="error"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRoutine(routine.id, routine.name); }}
                                        aria-label="eliminar"
                                        size="medium"
                                        sx={{ display: { xs: 'block', sm: 'none' } }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    {/* Versión Botón (Desktop) */}
                                    <Button 
                                        variant="outlined"
                                        color="error"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRoutine(routine.id, routine.name); }}
                                        startIcon={<DeleteIcon />}
                                        size="small"
                                        sx={{ display: { xs: 'none', sm: 'flex' } }}
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
                                        sx={{ flexGrow: { xs: 1, sm: 0 } }}
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
                                        sx={{ flexGrow: { xs: 1, sm: 0 } }}
                                    >
                                        Empezar
                                    </Button>
                                </Stack>
                            </Stack>
                        </Card>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default RoutinesPage;