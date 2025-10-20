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

// NUEVA RUTA: Ruta protegida para obtener una rutina específica por ID
router.get('/:routineId', authenticateToken, routineController.getOne);

// NUEVA RUTA: Ruta protegida para actualizar una rutina por ID
router.put('/:id', authenticateToken, routineController.updateRoutine);

module.exports = router;
