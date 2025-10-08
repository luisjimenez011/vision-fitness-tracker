const { UserRegistrationSchema } = require('../validation/authSchemas')
const authService = require('../services/authService')

/**
 * Controlador para el registro de usuario.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function register(req, res) {
  const { error, value } = UserRegistrationSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message) })
  }
  const { name, email, password } = value
  try {
    const userId = await authService.registerUser(name, email, password)
    return res.status(201).json({ userId })
  } catch (err) {
    console.error('Error en registro de usuario:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = {
  register
}
