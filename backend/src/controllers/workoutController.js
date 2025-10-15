const routineRepository = require('../repositories/routineRepository')
const aiService = require('../services/aiService');

/**
 * Finaliza y registra una sesión de entrenamiento.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function finishSession(req, res) {
  const userId = req.userId // De authenticateToken
  const { routineId, dayName, durationSeconds, logData } = req.body

  if (!routineId || !logData) {
    return res
      .status(400)
      .json({ error: 'routineId and logData are required.' })
  }

  try {
    const logId = await routineRepository.saveWorkoutSession(
      userId,
      routineId,
      dayName,
      durationSeconds,
      logData,
    )
    return res
      .status(201)
      .json({ message: 'Workout session saved successfully', logId })
  } catch (err) {
    console.error('Error saving workout session:', err)
    return res
      .status(500)
      .json({ error: 'Internal server error while saving workout session.' })
  }
}

/**
 * Obtiene el historial de entrenamientos del usuario autenticado.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getLogs(req, res) {
  const userId = req.userId // Obtenido del token

  try {
    // Asume que findWorkoutLogsByUserId ya fue añadida a routineRepository.js
    const logs = await routineRepository.findWorkoutLogsByUserId(userId)
    return res.status(200).json(logs)
  } catch (err) {
    console.error('Error fetching workout logs:', err)
    return res
      .status(500)
      .json({ error: 'Internal server error while fetching workout logs.' })
  }
}

/**
 * Obtiene el análisis de volumen de entrenamiento del usuario Y el análisis de IA.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getVolumeProgress(req, res) {
    const userId = req.userId;
    const daysBack = req.query.daysBack ? parseInt(req.query.daysBack, 10) : 180;
    
   
    const userProfile = { 
        goal: "Ganar masa muscular (Hipertrofia)",
        level: "Intermedio",
        // En una app real, buscarías esto en userRepository
    };

    try {
        const aggregatedVolume = await routineRepository.getAggregatedVolumeLogs(
            userId,
            daysBack,
        );

        if (!aggregatedVolume || aggregatedVolume.length === 0) {
            // Caso sin datos: Solo devolvemos datos vacíos sin análisis de IA
            return res.status(200).json({ volumeData: [], aiAnalysis: "No hay suficientes datos de entrenamiento registrados (mínimo 2 meses) para realizar un análisis de progresión." });
        }

       
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
}
