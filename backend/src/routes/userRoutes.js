const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Ruta para obtener las estadísticas clave y ejercicios más frecuentes
router.get('/stats', authenticateToken, userController.getProfileStats);

// Ruta para obtener los datos del mapa muscular y análisis de IA
router.get('/muscle-map', authenticateToken, userController.getMuscleMapAnalysis);

// Ruta para obtener la progresión global (Volumen, Duración, Reps) para los gráficos
router.get('/charts', authenticateToken, userController.getGlobalCharts);

module.exports = router;