const bcrypt = require('bcrypt')
const userRepository = require('../repositories/userRepository')

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

module.exports = {
  registerUser
}
