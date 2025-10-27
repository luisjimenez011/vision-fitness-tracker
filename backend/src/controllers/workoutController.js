const routineRepository = require('../repositories/routineRepository');
const aiService = require('../services/aiService');

/**
 * Finaliza y registra una sesión de entrenamiento completada.
 * Guarda los datos de la sesión (logData, duración, etc.) en el historial del usuario.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function finishSession(req, res) {
  const userId = req.userId;
  const { routineId, dayName, durationSeconds, logData } = req.body;

  if (!routineId || !logData) {
    return res
      .status(400)
      .json({ error: 'routineId and logData are required.' });
  }

  try {
    const logId = await routineRepository.saveWorkoutSession(
      userId,
      routineId,
      dayName,
      durationSeconds,
      logData,
    );
    return res
      .status(201)
      .json({ message: 'Workout session saved successfully', logId });
  } catch (err) {
    console.error('Error saving workout session:', err);
    return res
      .status(500)
      .json({ error: 'Internal server error while saving workout session.' });
  }
}

/**
 * Obtiene el historial detallado de entrenamientos del usuario autenticado (workout_logs).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getLogs(req, res) {
  const userId = req.userId;

  try {
    const logs = await routineRepository.findWorkoutLogsByUserId(userId);
    return res.status(200).json(logs);
  } catch (err) {
    console.error('Error fetching workout logs:', err);
    return res
      .status(500)
      .json({ error: 'Internal server error while fetching workout logs.' });
  }
}

/**
 * Obtiene el análisis de volumen de entrenamiento agregado por fecha (datos para el gráfico)
 * y el análisis de IA sobre dicha progresión.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getVolumeProgress(req, res) {
    const userId = req.userId;
    // Parsea daysBack o usa undefined para el valor por defecto del repositorio.
    const daysBack = req.query.daysBack ? parseInt(req.query.daysBack, 10) : undefined; 
    
    // Perfil de usuario (usado por la IA para contextualizar el análisis)
    const userProfile = { 
        goal: "Ganar masa muscular (Hipertrofia)",
        level: "Intermedio",
    };

    try {
        const aggregatedVolume = await routineRepository.getAggregatedVolumeLogs(
            userId,
            daysBack, 
        );

        if (!aggregatedVolume || aggregatedVolume.length === 0) {
            // Caso sin datos
            return res.status(200).json({ 
                volumeData: [], 
                aiAnalysis: "No hay suficientes datos de entrenamiento registrados para realizar un análisis de progresión." 
            });
        }

        // Análisis de IA basado en la progresión de volumen
        const aiAnalysis = await aiService.analyzeVolumeProgress(aggregatedVolume, userProfile);

        return res.status(200).json({ 
            volumeData: aggregatedVolume, 
            aiAnalysis: aiAnalysis 
        });

    } catch (err) {
        console.error('Error fetching volume analysis:', err);
        return res
            .status(500)
            .json({ error: 'Error interno al procesar el análisis de volumen.' });
    }
}

module.exports = {
  finishSession,
  getLogs,
  getVolumeProgress,
};