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
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" color="primary" align="center" sx={{ mb: 4, fontWeight: 700 }}>
        <AutoFixHighIcon sx={{ mr: 1, fontSize: 'inherit' }} /> Generación de Rutina con IA
      </Typography>

      {/* Mensajes de Estado */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress color="primary" sx={{ mr: 1 }} />
            <Typography color="text.secondary">Generando...</Typography>
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      {!routine ? (
        // ------------------
        // FORMULARIO DE INPUT
        // ------------------
        <Card sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Dinos un poco sobre ti
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Edad y Género */}
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
                    <MenuItem value="">Selecciona</MenuItem>
                    <MenuItem value="male">Masculino</MenuItem>
                    <MenuItem value="female">Femenino</MenuItem>
                    <MenuItem value="other">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Peso y Altura */}
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

              {/* Nivel de Fitness y Días */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="fitness-label" color="primary">Nivel de Fitness</InputLabel>
                  <Select 
                    labelId="fitness-label"
                    name="fitness_level" 
                    value={userProfile.fitness_level} 
                    onChange={handleChange} 
                    label="Nivel de Fitness"
                    color="primary"
                  >
                    <MenuItem value="">Selecciona</MenuItem>
                    <MenuItem value="beginner">Principiante</MenuItem>
                    <MenuItem value="intermediate">Intermedio</MenuItem>
                    <MenuItem value="advanced">Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Días disponibles (1-7)"
                  name="available_days"
                  type="number"
                  value={userProfile.available_days}
                  onChange={handleChange}
                  required
                  color="primary"
                  inputProps={{ min: 1, max: 7 }}
                />
              </Grid>

              {/* Objetivo */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tu Objetivo"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder="Ej: Perder 5kg, ganar fuerza en pecho y brazos"
                  required
                  color="primary"
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />

            {/* Botón de Generar */}
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              color="primary" 
              disabled={loading}
              startIcon={<AutoFixHighIcon />}
              size="large"
              sx={{ py: 1.5 }}
            >
              Generar mi Rutina Personalizada
            </Button>
          </Box>
        </Card>
      ) : (
        // ------------------
        // RUTINA GENERADA
        // ------------------
        <Card sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            <FitnessCenterIcon color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} /> Rutina Generada
          </Typography>
          <RoutineDisplay routineData={routine} onSave={handleSaveRoutine} onGenerateNew={handleGenerateNew} />
        </Card>
      )}
    </Container>
  );
}

export default HomePage;