const Joi = require('joi');
const { UserRegistrationSchema } = require('../validation/authSchemas'); 
const authService = require('../services/authService');

/**
 * Controlador para el registro de un nuevo usuario.
 * Valida los datos y llama al servicio de registro.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function register(req, res) {
  const { error, value } = UserRegistrationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message) });
  }
  
  const { name, email, password } = value;
  
  try {
    const userId = await authService.registerUser(name, email, password);
    return res.status(200).json({ 
        success: true, 
        userId: userId 
    });
  } catch (err) {
    console.error('Error en registro de usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}


/**
 * Controlador para la autenticación (login) de usuario.
 * Valida email y password, y devuelve un token de autenticación.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function login(req, res) {
  // Esquema simple para login
  const LoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  
  const { error, value } = LoginSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details.map(d => d.message) });
  }
  
  const { email, password } = value;
  
  try {
    const token = await authService.loginUser(email, password);
    return res.status(200).json({ token });
  } catch (err) {
    if (err.message === 'Credenciales inválidas') {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    console.error('Error en login de usuario:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  register,
  login
};