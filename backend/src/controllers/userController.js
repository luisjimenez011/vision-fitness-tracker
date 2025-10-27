const routineRepository = require('../repositories/routineRepository');
const aiService = require('../services/aiService');

/**
 * Endpoint para obtener las estadísticas básicas del perfil y ejercicios más frecuentes.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getProfileStats(req, res) {
    const userId = req.userId;

    try {
        // 1. Obtener stats (nombre, total entrenos, miembro desde)
        const stats = await routineRepository.getUserWorkoutStats(userId);
        
        if (!stats) {
             return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // 2. Obtener ejercicios más frecuentes
        const mostFrequentExercises = await routineRepository.getMostFrequentExercises(userId);

        const responseData = {
            username: stats.username,
            totalWorkouts: stats.totalWorkouts,
            memberSince: stats.memberSince,
            mostFrequentExercises: mostFrequentExercises,
        };

        return res.status(200).json(responseData);

    } catch (err) {
        console.error('Error al obtener las estadísticas del perfil:', err);
        return res.status(500).json({ error: 'Error interno al cargar las estadísticas.' });
    }
}

/**
 * Endpoint para obtener el mapa corporal y el análisis de IA.
 * Requiere datos de volumen agregado por grupo muscular.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getMuscleMapAnalysis(req, res) {
    const userId = req.userId;
    // Por defecto, analiza el último mes (30 días).
    const daysBack = req.query.daysBack || 30; 
    
    try {
        // 1. Obtener todos los logs de volumen para el período
        const aggregatedVolume = await routineRepository.getAggregatedVolumeLogs(
            userId, 
            daysBack
        );

        if (!aggregatedVolume || aggregatedVolume.length === 0) {
            return res.status(200).json({ 
                muscleVolume: {}, 
                aiAnalysis: "No hay datos suficientes para analizar el mapa muscular." 
            });
        }
        
        // 2. Procesar el volumen y generar el análisis con el servicio de IA
        const { muscleVolume, aiAnalysis } = await aiService.analyzeMuscleMap(aggregatedVolume);

        return res.status(200).json({ 
            muscleVolume, 
            aiAnalysis 
        });

    } catch (err) {
        console.error('Error al obtener el mapa muscular y análisis de IA:', err);
        return res.status(500).json({ error: 'Error interno al procesar el mapa corporal.' });
    }
}


/**
 * Endpoint para obtener la progresión global de los gráficos (volumen, duración, repeticiones).
 * El rango de tiempo es configurable por el cliente (daysBack).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getGlobalCharts(req, res) {
    const userId = req.userId;
    // Permite que el cliente pida un rango específico (por defecto: 365 días).
    const daysBack = req.query.daysBack ? parseInt(req.query.daysBack, 10) : 365; 

    try {
        const globalProgress = await routineRepository.getGlobalProgression(userId, daysBack);

        return res.status(200).json({ 
            progression: globalProgress 
        });

    } catch (err) {
        console.error('Error al obtener la progresión global:', err);
        return res.status(500).json({ error: 'Error interno al generar los gráficos.' });
    }
}

module.exports = {
    getProfileStats,
    getMuscleMapAnalysis,
    getGlobalCharts,
};