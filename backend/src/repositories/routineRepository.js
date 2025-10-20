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
  }
  /**
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
  }
  /**
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
  }
  /**
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
   * @param {number} [daysBack=3650] - Número de días a incluir en el análisis.
   * @returns {Promise<Array<Object>>} Un arreglo de objetos de volumen agregado.
   */
  async getAggregatedVolumeLogs(userId, daysBack = 3650) {
    const dateLimit = new Date()
    dateLimit.setDate(dateLimit.getDate() - daysBack)

    // 🛑 CONSULTA CORREGIDA: Sin indentación interna para evitar errores de sintaxis de PostgreSQL (código 42601)
    const query = `
WITH sets_expanded AS (
SELECT
wl.created_at,
jsonb_array_elements(wl.log_data) AS set_data 
FROM
workout_logs wl
WHERE
wl.user_id = $1 AND wl.created_at >= $2
)
SELECT
TO_CHAR(DATE_TRUNC('month', se.created_at), 'YYYY-MM') AS month_year,
(se.set_data ->> 'exerciseName') AS exercise_name,
SUM(
(se.set_data ->> 'weight')::NUMERIC * (se.set_data ->> 'reps')::NUMERIC
) AS total_volume,
SUM(
(se.set_data ->> 'reps')::NUMERIC
) AS total_reps,
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
`

    const values = [userId, dateLimit.toISOString()]
    const result = await pool.query(query, values)

    return result.rows.map((row) => ({
      monthYear: row.month_year,
      exerciseName: row.exercise_name,
      totalVolume: parseFloat(row.total_volume) || 0,
      totalReps: parseFloat(row.total_reps) || 0,
      averageWeight: parseFloat(row.average_weight) || 0,
    }))
  }

  /**
     * Actualiza el plan_json y el nombre de una rutina existente.
     * Dado que la tabla no tiene 'updated_at', solo actualizamos 'name' y 'plan_json'.
     * @param {number} routineId - ID de la rutina a actualizar
     * @param {string} name - Nuevo nombre de la rutina
     * @param {Object} planJson - Objeto JSON completo de la rutina
     * @returns {Promise<Object>} La rutina actualizada o null si no se encuentra.
     */
    async updatePlanJson(routineId, name, planJson) {
        const query = `
            UPDATE routines
            SET name = $2, plan_json = $3
            WHERE id = $1
            RETURNING id, name, plan_json, created_at, user_id;
            -- Devolvemos created_at en lugar de updated_at, ya que no existe.
        `;
        
        const values = [routineId, name, planJson]; 
        
        const result = await pool.query(query, values);
        
        return result.rows[0] || null;
    }

    /**
     * Elimina una rutina por su ID.
     * @param {number} routineId - ID de la rutina a eliminar
     * @returns {Promise<number>} Número de filas eliminadas (0 o 1)
     */
    async deleteById(routineId) {
        const query = 'DELETE FROM routines WHERE id = $1 RETURNING id';
        const values = [routineId];
        const result = await pool.query(query, values);
        return result.rowCount; // 1 si se eliminó, 0 si no se encontró
    }

   /**
     * Obtiene el número total de logs y la fecha de creación del usuario.
     * @param {number} userId - ID del usuario.
     * @returns {Promise<Object>} {totalWorkouts, memberSince, username}
     */
    async getUserWorkoutStats(userId) {
        const query = `
            SELECT 
                u.name AS username,
                u.created_at AS member_since,
                COALESCE(wl_count.total_workouts, 0) AS total_workouts
            FROM 
                users u
            LEFT JOIN (
                SELECT 
                    user_id, 
                    COUNT(id) AS total_workouts 
                FROM 
                    workout_logs 
                WHERE 
                    user_id = $1
                GROUP BY 
                    user_id
            ) wl_count ON wl_count.user_id = u.id
            WHERE 
                u.id = $1;
        `;
        const values = [userId];
        const result = await pool.query(query, values);
        
        if (!result.rows[0]) return null;

        // La lógica de manejar el caso sin logs se simplifica gracias al LEFT JOIN y COALESCE
        return {
            totalWorkouts: parseInt(result.rows[0].total_workouts, 10),
            memberSince: result.rows[0].member_since,
            username: result.rows[0].username,
        };
    }

    /**
     * Calcula los Ejercicios más Frecuentes.
     * @param {number} userId - ID del usuario.
     * @returns {Promise<Object>} Objeto con {exerciseName: count}
     */
    async getMostFrequentExercises(userId) {
        const query = `
            WITH exercise_names AS (
                SELECT
                    jsonb_array_elements(wl.log_data) ->> 'exerciseName' AS name
                FROM
                    workout_logs wl
                WHERE
                    wl.user_id = $1
            )
            SELECT
                name,
                COUNT(name) AS count
            FROM
                exercise_names
            WHERE
                name IS NOT NULL
            GROUP BY
                name
            ORDER BY
                count DESC;
        `;
        const values = [userId];
        const result = await pool.query(query, values);

        // Convertir el array de filas a un objeto {exerciseName: count}
        return result.rows.reduce((acc, row) => {
            acc[row.name] = parseInt(row.count, 10);
            return acc;
        }, {});
    }


    /**
     * Obtiene la progresión de Volumen, Duración y Reps agrupada por mes.
     * @param {number} userId - ID del usuario
     * @param {number} [daysBack=3650] - Filtro de tiempo para el análisis
     * @returns {Promise<Array<Object>>} Arreglo con la progresión mensual.
     */
    async getGlobalProgression(userId, daysBack = 3650) {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - daysBack);

        const query = `
            WITH sets_expanded AS (
                SELECT
                    wl.created_at,
                    wl.duration_seconds,
                    jsonb_array_elements(wl.log_data) AS set_data 
                FROM
                    workout_logs wl
                WHERE
                    wl.user_id = $1 AND wl.created_at >= $2
            )
            SELECT
                TO_CHAR(DATE_TRUNC('month', se.created_at), 'YYYY-MM') AS month_year,
                SUM(
                    (se.set_data ->> 'weight')::NUMERIC * (se.set_data ->> 'reps')::NUMERIC
                ) AS total_volume_month,
                SUM(
                    (se.set_data ->> 'reps')::NUMERIC
                ) AS total_reps_month,
                SUM(
                    se.duration_seconds
                ) AS total_duration_seconds
            FROM
                sets_expanded se
            GROUP BY
                month_year
            ORDER BY
                month_year;
        `;
        const values = [userId, dateLimit.toISOString()];
        const result = await pool.query(query, values);

        return result.rows.map((row) => ({
            monthYear: row.month_year,
            totalVolume: parseFloat(row.total_volume_month) || 0,
            totalReps: parseFloat(row.total_reps_month) || 0,
            totalDurationSeconds: parseInt(row.total_duration_seconds, 10) || 0,
        }));
    }
}

module.exports = new RoutineRepository()
