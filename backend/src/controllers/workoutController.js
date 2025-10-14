const routineRepository = require('../repositories/routineRepository');

/**
 * Finaliza y registra una sesión de entrenamiento.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function finishSession(req, res) {
  const userId = req.userId; // De authenticateToken
  const { routineId, dayName, durationSeconds, logData } = req.body;

  if (!routineId || !logData) {
    return res.status(400).json({ error: 'routineId and logData are required.' });
  }

  try {
    const logId = await routineRepository.saveWorkoutSession(
      userId,
      routineId,
      dayName,
      durationSeconds,
      logData
    );
    return res.status(201).json({ message: 'Workout session saved successfully', logId });
  } catch (err) {
    console.error('Error saving workout session:', err);
    return res.status(500).json({ error: 'Internal server error while saving workout session.' });
  }
}

/**
 * Obtiene el historial de entrenamientos del usuario autenticado.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getLogs(req, res) {
    const userId = req.userId; // Obtenido del token

    try {
        // Asume que findWorkoutLogsByUserId ya fue añadida a routineRepository.js
        const logs = await routineRepository.findWorkoutLogsByUserId(userId);
        return res.status(200).json(logs);
    } catch (err) {
        console.error('Error fetching workout logs:', err);
        return res.status(500).json({ error: 'Internal server error while fetching workout logs.' });
    }
}

module.exports = {
  finishSession,
  getLogs,
};
