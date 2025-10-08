
const bcrypt = require('bcrypt')
const userRepository = require('../repositories/userRepository')
const jwt = require('jsonwebtoken')

/**
 * Registra un nuevo usuario en el sistema.
 * @param {string} name - Nombre del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<number>} ID del usuario creado
 */
async function registerUser(name, email, password) {
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const userId = await userRepository.create(name, email, passwordHash)
  return userId
}


/**
 * Inicia sesión de usuario y retorna un JWT si las credenciales son válidas.
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Token JWT
 * @throws {Error} Si las credenciales son inválidas
 */
async function loginUser(email, password) {
  const user = await userRepository.findByEmail(email)
  if (!user) {
    throw new Error('Credenciales inválidas')
  }
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw new Error('Credenciales inválidas')
  }
  const payload = { userId: user.id }
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no configurado en variables de entorno')
  const token = jwt.sign(payload, secret, { expiresIn: '7d' })
  return token
}

module.exports = {
  registerUser,
  loginUser
}
