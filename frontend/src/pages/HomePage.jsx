import React, { useState } from 'react';
import apiClient from '../api/apiClient.js';
import RoutineDisplay from '../components/RoutineDisplay.jsx';

// ⬇️ IMPORTACIONES DE MUI
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

function HomePage() {
  const [userProfile, setUserProfile] = useState({
    age: '',
    gender: '',
    weight_kg: '',
    height_cm: '',
    fitness_level: '',
    available_days: 4,
  });
  const [goal, setGoal] = useState('');
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoutine(null);
    setSuccessMessage('');
    try {
      const response = await apiClient.post('/routine/generate', {
        userProfile: {
          ...userProfile,
          // Aseguramos la conversión de tipo aquí, aunque TextField ayuda
          age: Number(userProfile.age),
          weight_kg: Number(userProfile.weight_kg),
          height_cm: Number(userProfile.height_cm),
          available_days: Number(userProfile.available_days),
        },
        goal,
      });
      setRoutine(response.data);
    } catch (err) {
      // Manejo de errores más detallado si la API lo proporciona
      const errorMessage = err.response?.data?.error || 'Error al generar rutina. Inténtalo de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  const handleGenerateNew = () => {
    setRoutine(null);
    setGoal('');
    // Reseteo de perfil opcional, lo mantenemos por consistencia con el código original
    setUserProfile({
      age: '',
      gender: '',
      weight_kg: '',
      height_cm: '',
      fitness_level: '',
      available_days: 4,
    });
  };

  // ----------------------------------------------------
  // RENDERIZADO DEL COMPONENTE CON MUI
  // ----------------------------------------------------
  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Título Principal */}
      <Typography variant="h3" component="h1" color="primary" align="center" sx={{ mb: 4, fontWeight: 700 }}>
        <AutoFixHighIcon sx={{ mr: 1, fontSize: 'inherit' }} /> Generación de Rutina con **IA**
      </Typography>

      {/* Mensajes de Estado */}
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
        // FORMULARIO DE INPUT (Diseño Mejorado) 🚀
        // -------------------------------------------
        <Card sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, boxShadow: 6 }}>
          <Box component="form" onSubmit={handleSubmit}>
            
            {/* 1. INFORMACIÓN PERSONAL Y FÍSICA */}
            <Typography variant="h5" sx={{ mb: 1, color: 'secondary.main', fontWeight: 'bold' }}>
                <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Tu Perfil Básico
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Cuéntanos tu edad, género y métricas para un cálculo preciso.
            </Typography>

            <Grid container spacing={3}>
              {/* Edad - Ocupa la mitad en sm+ */}
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
              {/* Género - Ocupa la mitad en sm+ (IGUAL DE GRANDE QUE EDAD) */}
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
                    // 🚨 SOLUCIÓN GÉNERO: Aseguramos que el select no tenga un ancho restringido
                    // Aunque fullWidth debería ser suficiente, la naturaleza del Select y Grid
                    // puede causar esto. Ajustar el label o el tamaño es la clave.
                    // Hemos revisado que la estructura de Grid ya le da el 100% en móvil (xs=12).
                  >
                    <MenuItem value="male">Masculino</MenuItem>
                    <MenuItem value="female">Femenino</MenuItem>
                    <MenuItem value="other">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* Peso - Ocupa la mitad en sm+ */}
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
              {/* Altura - Ocupa la mitad en sm+ */}
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

            {/* 2. NIVEL Y DISPONIBILIDAD */}
            <Typography variant="h5" sx={{ mb: 1, color: 'secondary.main', fontWeight: 'bold' }}>
                <CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Experiencia y Tiempo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Define tu experiencia actual y cuántos días a la semana entrenarás.
            </Typography>

            <Grid container spacing={3}>
              {/* Nivel de Fitness - En móvil forzamos etiqueta visible y clara */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  {/* 🚨 SOLUCIÓN NIVEL: Hemos acortado ligeramente el label para dar más espacio horizontal en móviles pequeños 
                       y asegurar que 'Nivel' se vea completo, ya que "Nivel de Fitness" es largo. 
                       La etiqueta "Nivel de Fitness" ya es visible en la lista de opciones. */}
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
              {/* Días Disponibles - En móvil forzamos etiqueta visible y clara */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Días disponibles" // 🚨 SOLUCIÓN DÍAS: Acortamos el label de "Días disponibles (1-7)" a "Días disponibles"
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

              {/* Objetivo (Full Width) */}
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

            {/* Botón de Generar (Énfasis) */}
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
        // ------------------
        // RUTINA GENERADA (Mantenida)
        // ------------------
        <Card sx={{ p: { xs: 3, sm: 5 }, borderRadius: 3, boxShadow: 6 }}>
          <Typography variant="h4" sx={{ mb: 3, color: 'secondary.main', fontWeight: 'bold' }}>
            <FitnessCenterIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} /> Rutina Generada
          </Typography>
          <RoutineDisplay routineData={routine} onSave={handleSaveRoutine} onGenerateNew={handleGenerateNew} />
        </Card>
      )}
    </Container>
  );
}

export default HomePage;