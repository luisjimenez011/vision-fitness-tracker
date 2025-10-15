const pool = require('../db/db.config')

class RoutineRepository {
  /**
   * Inserta una nueva rutina (plan completo o manual).
   * @param {number} userId - ID del usuario
   * @param {string} name - Nombre de la rutina
   * @param {Object} planJson - Objeto JSON de la rutina completa
   * @returns {Promise<number>} ID de la rutina creada
   */
  async create(userId, name, planJson) {
    const query = `INSERT INTO routines (user_id, name, plan_json) VALUES ($1, $2, $3) RETURNING id`
    const values = [userId, name, planJson]
    const result = await pool.query(query, values)
    return result.rows[0].id
  } /**
   * [NUEVA FUNCIÓN] Inserta una sesión de entrenamiento individual para planes de IA.
   * @param {number} userId - ID del usuario
   * @param {string} planName - Nombre general del plan (ej: "Rutina Semanal...")
   * @param {string} dayName - Nombre específico del día (ej: "Día 1: Torso")
   * @param {Object} sessionJson - Objeto JSON que contiene SOLO el workout de ese día
   * @returns {Promise<number>} ID de la sesión creada
   */

  async createWorkoutSessionRoutine(userId, planName, dayName, sessionJson) {
    // Concatenamos el nombre del plan y el nombre del día
    const combinedName = `${planName} - ${dayName}`

    const query = `INSERT INTO routines (user_id, name, plan_json) VALUES ($1, $2, $3) RETURNING id`
    const values = [userId, combinedName, sessionJson]
    const result = await pool.query(query, values)
    return result.rows[0].id
  } /**
   * Busca todas las rutinas de un usuario específico.
   * @param {number} userId - ID del usuario.
   * @returns {Promise<Array<Object>>} Un arreglo de objetos de rutina.
   */

  async findByUserId(userId) {
    const query = `SELECT id, name, created_at, plan_json FROM routines WHERE user_id = $1 ORDER BY created_at DESC`
    const values = [userId]
    const result = await pool.query(query, values)
    return result.rows
  }
   /**
   * Busca una rutina solo por su ID.
   */

  async findById(routineId) {
    const query =
      'SELECT id, user_id, name, created_at, plan_json ' +
      'FROM routines ' +
      'WHERE id = $1'
    const values = [routineId]
    const result = await pool.query(query, values)
    return result.rows[0] || null
  }

  async saveWorkoutSession(
    userId,
    routineId,
    dayName,
    durationSeconds,
    logData,
  ) {
    const query =
      'INSERT INTO workout_logs (user_id, routine_id, day_name, duration_seconds, log_data) VALUES ($1, $2, $3, $4, $5) RETURNING id'
    const logJsonString = JSON.stringify(logData)

    const values = [userId, routineId, dayName, durationSeconds, logJsonString]
    const result = await pool.query(query, values)
    return result.rows[0].id
  } /**
   * Busca todos los logs de entrenamiento de un usuario.
   */

  async findWorkoutLogsByUserId(userId) {
    const query =
      'SELECT id, routine_id, day_name, duration_seconds, log_data, created_at FROM workout_logs WHERE user_id = $1 ORDER BY created_at DESC'
    const values = [userId]
    const result = await pool.query(query, values)
    return result.rows
  }

/**
     * Obtiene el volumen agregado de los logs de entrenamiento de un usuario.
     * Agrupa por Ejercicio y Mes/Año.
     * @param {number} userId - ID del usuario
     * @param {number} [daysBack=180] - Número de días a incluir en el análisis.
     * @returns {Promise<Array<Object>>} Un arreglo de objetos de volumen agregado.
     */
    async getAggregatedVolumeLogs(userId, daysBack = 180) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - daysBack);

        const query = `
            WITH sets_expanded AS (
                SELECT
                    wl.created_at,
                    jsonb_array_elements(wl.log_data) as set_data 
                FROM
                    workout_logs wl
                WHERE
                    wl.user_id = $1 AND wl.created_at >= $2
            )
            SELECT
                TO_CHAR(DATE_TRUNC('month', se.created_at), 'YYYY-MM') AS month_year,
                (se.set_data ->> 'exerciseName') AS exercise_name,
                -- 🛑 1. Volumen Total (igual que antes)
                SUM(
                    (se.set_data ->> 'weight')::NUMERIC * (se.set_data ->> 'reps')::NUMERIC
                ) AS total_volume,
                -- 🛑 2. Total de Repeticiones
                SUM(
                    (se.set_data ->> 'reps')::NUMERIC
                ) AS total_reps,
                -- 🛑 3. Peso Promedio (Volumen Total / Total de Repeticiones)
                CASE 
                    WHEN SUM((se.set_data ->> 'reps')::NUMERIC) > 0 
                    THEN SUM((se.set_data ->> 'weight')::NUMERIC * (se.set_data ->> 'reps')::NUMERIC) / SUM((se.set_data ->> 'reps')::NUMERIC)
                    ELSE 0
                END AS average_weight
            FROM
                sets_expanded se
            GROUP BY
                month_year,
                exercise_name
            ORDER BY
                month_year,
                total_volume DESC;
        `;
        
        const values = [userId, dateLimit.toISOString()];
        const result = await pool.query(query, values);
        
        return result.rows.map(row => ({
            monthYear: row.month_year,
            exerciseName: row.exercise_name,
            totalVolume: parseFloat(row.total_volume) || 0,
            totalReps: parseFloat(row.total_reps) || 0,
            averageWeight: parseFloat(row.average_weight) || 0 
        }));
    }
}

module.exports = new RoutineRepository()
