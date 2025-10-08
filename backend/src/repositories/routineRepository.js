const pool = require('../db/db.config')

/**
 * Repositorio para operaciones CRUD sobre rutinas.
 * Solo acceso a la base de datos, sin lógica de negocio.
 */
class RoutineRepository {
  /**
   * Inserta una nueva rutina para un usuario.
   * @param {number} userId - ID del usuario
   * @param {Object} planJson - Objeto JSON de la rutina
   * @returns {Promise<number>} ID de la rutina creada
   */
  async create(userId, planJson) {
    const query = `INSERT INTO routines (user_id, name, plan_json) VALUES ($1, $2, $3) RETURNING id`
    const values = [userId, planJson.name, planJson]
    const result = await pool.query(query, values)
    return result.rows[0].id
  }
}

module.exports = new RoutineRepository()
