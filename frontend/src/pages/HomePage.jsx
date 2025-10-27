import React, { useState } from 'react';
import apiClient from '../api/apiClient.js';
import RoutineDisplay from '../components/RoutineDisplay.jsx';


import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Alert, 
    Container, 
    CircularProgress, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel,
    Grid,
    Card,
    Divider
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

/**
 * Componente principal para la generación de rutinas de fitness asistida por IA.
 * Permite al usuario ingresar su perfil y objetivo, generar una rutina y guardarla.
 */
function HomePage() {
    // Estado para los datos del perfil del usuario (valores iniciales para la IU)
    const [userProfile, setUserProfile] = useState({
        age: '',
        gender: '',
        weight_kg: '',
        height_cm: '',
        fitness_level: '',
        available_days: 4, // Valor predeterminado
    });
    const [goal, setGoal] = useState('');
    const [routine, setRoutine] = useState(null);
    
    // Estados de la interfaz de usuario
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    /**
     * Maneja el cambio en los campos de entrada del perfil.
     */
    const handleChange = e => {
        const { name, value } = e.target;
        setUserProfile(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Maneja el envío del formulario para generar la rutina.
     * Envía los datos del perfil y el objetivo a la API.
     */
    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRoutine(null);
        setSuccessMessage('');
        
        // Conversión de tipos para asegurar que los números se envíen como tales
        const profileToSend = {
            ...userProfile,
            age: Number(userProfile.age),
            weight_kg: Number(userProfile.weight_kg),
            height_cm: Number(userProfile.height_cm),
            available_days: Number(userProfile.available_days),
        };

        try {
            const response = await apiClient.post('/routine/generate', {
                userProfile: profileToSend,
                goal,
            });
            setRoutine(response.data);
        } catch (err) {
            // Extrae el mensaje de error del backend o usa un mensaje por defecto
            const errorMessage = err.response?.data?.error || 'Error al generar rutina. Inténtalo de nuevo.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Maneja el guardado de la rutina generada.
     * @param {object} routineToSave - La rutina a persistir en el backend.
     */
    const handleSaveRoutine = async (routineToSave) => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await apiClient.post('/routine/save', routineToSave);
            setSuccessMessage(response.data.message);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al guardar la rutina.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resetea el estado para mostrar el formulario de generación nuevamente.
     */
    const handleGenerateNew = () => {
        setRoutine(null);
        setGoal('');
        // Opcionalmente, resetear el perfil si se desea empezar de cero
        setUserProfile({
            age: '',
            gender: '',
            weight_kg: '',
            height_cm: '',
            fitness_level: '',
            available_days: 4,
        });
        setError('');
        setSuccessMessage('');
    };

    // ----------------------------------------------------
    // Renderizado del componente
    // ----------------------------------------------------
    return (
        <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            
            {/* Título Principal de la Página */}
            <Typography variant="h3" component="h1" color="primary" align="center" sx={{ mb: 4, fontWeight: 700 }}>
                <AutoFixHighIcon sx={{ mr: 1, fontSize: 'inherit' }} /> Generación de Rutina con **IA**
            </Typography>

            {/* Mensajes de Estado (Carga, Éxito, Error) */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <CircularProgress color="primary" sx={{ mr: 1 }} />
                    <Typography color="text.secondary" fontWeight="bold">Generando tu rutina...</Typography>
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

            {!routine ? (
                // -------------------------------------------
                // Vista: Formulario de Generación
                // -------------------------------------------
                <Card sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, boxShadow: 6 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        
                        {/* 1. SECCIÓN: INFORMACIÓN PERSONAL Y FÍSICA */}
                        <Typography variant="h5" sx={{ mb: 1, color: 'secondary.main', fontWeight: 'bold' }}>
                            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Tu Perfil Básico
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Cuéntanos tu edad, género y métricas para un cálculo preciso.
                        </Typography>

                        <Grid container spacing={3}>
                            {/* Edad */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Edad"
                                    name="age"
                                    type="number"
                                    value={userProfile.age}
                                    onChange={handleChange}
                                    required
                                    color="primary"
                                    inputProps={{ min: 15, max: 100 }}
                                />
                            </Grid>
                            {/* Género */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel id="gender-label" color="primary">Género</InputLabel>
                                    <Select 
                                        labelId="gender-label"
                                        name="gender" 
                                        value={userProfile.gender} 
                                        onChange={handleChange} 
                                        label="Género"
                                        color="primary"
                                    >
                                        <MenuItem value="male">Masculino</MenuItem>
                                        <MenuItem value="female">Femenino</MenuItem>
                                        <MenuItem value="other">Otro</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* Peso */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Peso (kg)"
                                    name="weight_kg"
                                    type="number"
                                    value={userProfile.weight_kg}
                                    onChange={handleChange}
                                    required
                                    color="primary"
                                />
                            </Grid>
                            {/* Altura */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Altura (cm)"
                                    name="height_cm"
                                    type="number"
                                    value={userProfile.height_cm}
                                    onChange={handleChange}
                                    required
                                    color="primary"
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4 }} />

                        {/* 2. SECCIÓN: NIVEL Y OBJETIVO */}
                        <Typography variant="h5" sx={{ mb: 1, color: 'secondary.main', fontWeight: 'bold' }}>
                            <CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Experiencia y Tiempo
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Define tu experiencia actual y cuántos días a la semana entrenarás.
                        </Typography>

                        <Grid container spacing={3}>
                            {/* Nivel de Fitness */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel id="fitness-label" color="primary">Nivel de Exp.</InputLabel>
                                    <Select 
                                        labelId="fitness-label"
                                        name="fitness_level" 
                                        value={userProfile.fitness_level} 
                                        onChange={handleChange} 
                                        label="Nivel de Exp."
                                        color="primary"
                                    >
                                        <MenuItem value="beginner">Principiante (menos de 6 meses)</MenuItem>
                                        <MenuItem value="intermediate">Intermedio (6 meses - 2 años)</MenuItem>
                                        <MenuItem value="advanced">Avanzado (más de 2 años)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* Días Disponibles */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Días disponibles"
                                    name="available_days"
                                    type="number"
                                    value={userProfile.available_days}
                                    onChange={handleChange}
                                    required
                                    color="primary"
                                    inputProps={{ min: 1, max: 7 }}
                                    placeholder="1-7 días"
                                />
                            </Grid>

                            {/* Objetivo (Campo Multilínea) */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Tu Objetivo Específico"
                                    value={goal}
                                    onChange={e => setGoal(e.target.value)}
                                    placeholder="Ej: Perder 5kg en 3 meses, ganar fuerza..."
                                    required
                                    color="primary"
                                    multiline 
                                    rows={2} 
                                    sx={{ mt: 1 }} 
                                />
                            </Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 4 }} />

                        {/* Botón de Generar */}
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            color="primary" 
                            disabled={loading}
                            startIcon={<AutoFixHighIcon />}
                            size="large"
                            sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }} 
                        >
                            Generar mi Rutina Personalizada
                        </Button>
                    </Box>
                </Card>
            ) : (
                // -------------------------------------------
                // Vista: Rutina Generada
                // -------------------------------------------
                <Card sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, boxShadow: 6 }}>
                    <Typography variant="h4" sx={{ mb: 3, color: 'secondary.main', fontWeight: 'bold' }}>
                        <FitnessCenterIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} /> Rutina Generada
                    </Typography>
                    {/* El componente RoutineDisplay maneja la visualización y las acciones (Guardar, Generar Nuevo) */}
                    <RoutineDisplay 
                        routineData={routine} 
                        onSave={handleSaveRoutine} 
                        onGenerateNew={handleGenerateNew} 
                    />
                </Card>
            )}
        </Container>
    );
}

export default HomePage;