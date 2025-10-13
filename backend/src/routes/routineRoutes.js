const express = require('express');
const routineController = require('../controllers/routineController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Ruta protegida para generar rutina con IA
router.post('/generate', authenticateToken, routineController.generate);

// Ruta protegida para guardar una rutina
router.post('/save', authenticateToken, routineController.save);

// Ruta protegida para obtener todas las rutinas guardadas por el usuario
router.get('/my-routines', authenticateToken, routineController.getMine);

module.exports = router;
