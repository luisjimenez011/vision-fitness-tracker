import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

// ⬇️ IMPORTACIONES DE MUI
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Stack, // ⭐️ Importamos Stack para mejor gestión de botones
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

/**
 * Componente para crear una nueva rutina de entrenamiento de forma manual.
 */
const RoutineCreatePage = () => {
  const navigate = useNavigate();

  // Estado base para un ejercicio
  const initialExerciseState = {
    name: "",
    sets: 3,
    reps: 10,
    weight: 0,
    notes: "",
  };

  // Estado de la rutina
  const [routine, setRoutine] = useState({
    name: "Mi Nueva Rutina Manual",
    description: "Rutina personalizada creada por mí.",
    workouts: [
      {
        day: "Día Único",
        focus: "General",
        exercises: [initialExerciseState],
      },
    ],
  });

  // Estado UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- MÉTODOS CLAVE (Sin cambios) ---
  const handleAddExercise = () => {
    const updatedWorkouts = [...routine.workouts];
    updatedWorkouts[0].exercises.push(initialExerciseState);
    setRoutine({ ...routine, workouts: updatedWorkouts });
  };

  const handleRemoveExercise = (index) => {
    if (routine.workouts[0].exercises.length <= 1) {
      setError("Una rutina debe tener al menos un ejercicio.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    const updatedWorkouts = [...routine.workouts];
    updatedWorkouts[0].exercises.splice(index, 1);
    setRoutine({ ...routine, workouts: updatedWorkouts });
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedWorkouts = [...routine.workouts];

    const finalValue = ["sets", "reps", "weight"].includes(field)
      ? Math.max(0, parseFloat(value) || 0)
      : value;

    updatedWorkouts[0].exercises[index][field] = finalValue;
    setRoutine({ ...routine, workouts: updatedWorkouts });
  };

  const handleRoutineChange = (e) => {
    const { name, value } = e.target;
    setRoutine((prev) => ({ ...prev, [name]: value }));
  };

  // --- MÉTODO CLAVE PARA GUARDAR EN LA API (Sin cambios, ya estaba bien) ---

  const handleSaveRoutine = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!routine.name.trim() || routine.workouts[0].exercises.length === 0) {
      setError("La rutina debe tener un nombre y al menos un ejercicio.");
      return;
    }

    const cleanedWorkouts = routine.workouts.map((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => {
        const { weight, ...rest } = exercise;
        return rest;
      }),
    }));

    const apiPayload = {
      name: routine.name.trim(),
      description: routine.description.trim(),
      plan_json: {
        // 💡 Aseguramos que plan_json contenga el array 'workouts'
        workouts: cleanedWorkouts,
      },
    };

    try {
      setLoading(true);

      const response = await apiClient.post("/routine/save", apiPayload);

      setSuccessMessage(
        `Rutina guardada con éxito. ID: ${response.data.routineId}`
      );

      setTimeout(() => {
        navigate("/routines");
      }, 1500);
    } catch (err) {
      console.error("Error al guardar la rutina:", err);
      const errorMessage =
        err.response?.data?.error || "Error del servidor al guardar la rutina.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO (Diseño con MUI y Responsividad) ---
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Encabezado y Botón Volver */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // Stack en móvil
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          color="primary"
          sx={{ mb: { xs: 2, sm: 0 } }}
        >
          Crear Rutina Manual
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/routines")}
          startIcon={<ChevronLeftIcon />}
        >
          Volver a Rutinas
        </Button>
      </Box>

      {/* Mensajes de feedback */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* --- Formulario Principal --- */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Nombre de la Rutina (Ya es 12/12) */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre de la Rutina"
              name="name"
              value={routine.name}
              onChange={handleRoutineChange}
              required
              sx={{ mb: 1 }}
            />
          </Grid>
          {/* Descripción de la Rutina (Ya es 12/12) */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción (opcional)"
              name="description"
              value={routine.description}
              onChange={handleRoutineChange}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" sx={{ mb: 2, color: "text.primary" }}>
          Ejercicios
        </Typography>

        {/* --- Listado de Ejercicios --- */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {routine.workouts[0].exercises.map((exercise, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: { xs: 2, sm: 3 }, // Padding responsivo
                borderLeft: "5px solid",
                borderColor: "primary.main",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Ejercicio #{index + 1}
                </Typography>
                {/* El botón Eliminar ya es responsivo */}
                <IconButton
                  onClick={() => handleRemoveExercise(index)}
                  color="error"
                  aria-label="eliminar ejercicio"
                  disabled={
                    loading || routine.workouts[0].exercises.length <= 1
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                {/* Nombre del Ejercicio (Ocupa el ancho completo en móvil) */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre del Ejercicio"
                    value={exercise.name}
                    onChange={(e) =>
                      handleExerciseChange(index, "name", e.target.value)
                    }
                    required
                    size="small"
                  />
                </Grid>

                {/* ⭐️ Series, Reps, Peso: 1/3 del ancho en móvil ⭐️ */}
                <Grid item xs={4} sm={3}>
                  <TextField
                    fullWidth
                    label="Series"
                    type="number"
                    value={exercise.sets}
                    onChange={(e) =>
                      handleExerciseChange(index, "sets", e.target.value)
                    }
                    inputProps={{ min: 1 }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={4} sm={3}>
                  <TextField
                    fullWidth
                    label="Reps"
                    type="number"
                    value={exercise.reps}
                    onChange={(e) =>
                      handleExerciseChange(index, "reps", e.target.value)
                    }
                    inputProps={{ min: 1 }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={4} sm={3}>
                  <TextField
                    fullWidth
                    label="Peso (kg)"
                    type="number"
                    value={exercise.weight}
                    onChange={(e) =>
                      handleExerciseChange(index, "weight", e.target.value)
                    }
                    inputProps={{ step: 0.5 }}
                    size="small"
                  />
                </Grid>

                {/* Notas (En desktop puede ocupar el espacio restante, o el ancho completo) */}
                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    label="Notas del ejercicio (opcional)"
                    value={exercise.notes}
                    onChange={(e) =>
                      handleExerciseChange(index, "notes", e.target.value)
                    }
                    multiline
                    rows={1}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>

        {/* Botón Añadir Ejercicio */}
        <Box sx={{ textAlign: "center", mt: 3, mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleAddExercise}
            startIcon={<AddIcon />}
            disabled={loading}
            sx={{ width: { xs: "100%", sm: "auto" } }} // ⭐️ Ancho completo en móvil
          >
            Añadir Ejercicio
          </Button>
        </Box>
      </Paper>

      {/* Botón de Guardar */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleSaveRoutine}
          startIcon={
            loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          disabled={loading}
          sx={{
            px: 5,
            py: 1.5,
            width: { xs: "100%", sm: "auto" }, // ⭐️ Ancho completo en móvil
          }}
        >
          {loading ? "Guardando..." : "Guardar Rutina"}
        </Button>
      </Box>
    </Container>
  );
};

export default RoutineCreatePage;
