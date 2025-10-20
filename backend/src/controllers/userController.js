const routineRepository = require('../repositories/routineRepository');
const aiService = require('../services/aiService');
// Nota: Deberías crear un userRepository o usar el existente, pero el totalWorkouts 
// se obtiene mejor desde routineRepository por la dependencia de workout_logs.

/**
 * Endpoint para obtener las estadísticas básicas del perfil y ejercicios más frecuentes.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
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
            // Puedes añadir userId aquí si el frontend lo necesita
        };

        return res.status(200).json(responseData);

    } catch (err) {
        console.error('Error al obtener las estadísticas del perfil:', err);
        return res.status(500).json({ error: 'Error interno al cargar las estadísticas.' });
    }
}

/**
 * Endpoint para obtener el mapa corporal y el análisis de IA.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getMuscleMapAnalysis(req, res) {
    const userId = req.userId;
    // Por defecto, analiza el último mes (30 días), pero puedes hacerlo configurable
    const daysBack = req.query.daysBack || 30; 
    
    // NOTA CLAVE: Para que esto funcione, necesitas datos de volumen AGREGADO POR MÚSCULO.
    // Como NO has modificado la BD, necesitas mapear los exerciseName a muscleGroup
    // dentro de tu código de backend (o IA service).

    try {
        // 1. Obtener todos los logs de volumen para el período (puedes reutilizar getAggregatedVolumeLogs)
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
        
        // 2. Llamar al servicio de IA o a una función local para procesar el volumen por músculo
        // En una aplicación real, el aiService haría el mapeo (ej: 'Press Banca' -> 'Pecho')
        // y calcularía el porcentaje de volumen total por músculo.
        
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
 * Endpoint para obtener la progresión global de los gráficos.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getGlobalCharts(req, res) {
    const userId = req.userId;
    // Permite que el cliente pida 30, 90, 180, 365 días (1 mes, 3 meses, etc.)
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