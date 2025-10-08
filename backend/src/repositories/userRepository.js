const pool = require('../db/db.config')

/**
 * Repositorio de usuarios para acceso a la base de datos.
 * Solo operaciones CRUD, sin lógica de negocio.
 */
class UserRepository {
  /**
   * Busca un usuario por email.
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1'
    const values = [email]
    const result = await pool.query(query, values)
    return result.rows[0] || null
  }

  /**
   * Crea un nuevo usuario.
   * @param {string} name - Nombre del usuario
   * @param {string} email - Email del usuario
   * @param {string} passwordHash - Hash de la contraseña
   * @returns {Promise<number>} ID del usuario creado
   */
  async create(name, email, passwordHash) {
    const query = `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`
    const values = [name, email, passwordHash]
    const result = await pool.query(query, values)
    return result.rows[0].id
  }
}

module.exports = new UserRepository()
