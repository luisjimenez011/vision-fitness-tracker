const express = require('express')
const authController = require('../controllers/authController')

const router = express.Router()

// Ruta para registro de usuario
router.post('/register', authController.register)

// Ruta para login de usuario
router.post('/login', authController.login)

module.exports = router
