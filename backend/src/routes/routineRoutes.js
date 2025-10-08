const express = require('express')
const routineController = require('../controllers/routineController')
const { authenticateToken } = require('../middlewares/authMiddleware')

const router = express.Router()

// Ruta protegida para generar rutina con IA
router.post('/generate-routine', authenticateToken, routineController.generate)

module.exports = router
