const express = require('express');
const workoutController = require('../controllers/workoutController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Ruta protegida para finalizar una sesión de entreno
router.post('/finish-session', authenticateToken, workoutController.finishSession);

module.exports = router;
