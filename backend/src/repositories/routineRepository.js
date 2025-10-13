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
  async create(userId, name, planJson) {
    const query = `INSERT INTO routines (user_id, name, plan_json) VALUES ($1, $2, $3) RETURNING id`;
    const values = [userId, name, planJson];
    const result = await pool.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Busca todas las rutinas de un usuario específico.
   * @param {number} userId - ID del usuario.
   * @returns {Promise<Array<Object>>} Un arreglo de objetos de rutina.
   */
  async findByUserId(userId) {
    const query = `
      SELECT id, name, created_at, plan_json 
      FROM routines 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

 /**
   * BUSCADOR CORREGIDO: Busca una rutina solo por su ID. 
   * La verificación de propiedad (user_id) se hace en el controlador.
   * @param {number} routineId - ID de la rutina.
   * @returns {Promise<Object | null>} El objeto de la rutina o null si no existe.
   */
  async findById(routineId) {
    // CORRECCIÓN DEFINITIVA: Usamos concatenación de strings para eliminar
    // el riesgo de caracteres invisibles en el template string.
    const query = 'SELECT id, user_id, name, created_at, plan_json ' +
                  'FROM routines ' +
                  'WHERE id = $1';
    
    const values = [routineId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

 async saveWorkoutSession(userId, routineId, dayName, durationSeconds, logData) {
    // CORRECCIÓN CLAVE: Convertimos a string simple de una línea para evitar el error 42601.
    const query = 'INSERT INTO workout_logs (user_id, routine_id, day_name, duration_seconds, log_data) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    
    // Serialización JSON: Necesaria para el tipo JSONB en PostgreSQL.
    const logJsonString = JSON.stringify(logData);

    const values = [userId, routineId, dayName, durationSeconds, logJsonString];
    const result = await pool.query(query, values);
    return result.rows[0].id;
  }
}

module.exports = new RoutineRepository()
