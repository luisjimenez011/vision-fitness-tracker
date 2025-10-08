const express = require('express')
const routineController = require('../controllers/routineController')

const router = express.Router()

// Ruta para generar rutina con IA
router.post('/generate-routine', routineController.generate)

module.exports = router
