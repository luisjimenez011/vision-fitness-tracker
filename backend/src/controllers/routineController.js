const aiService = require('../services/aiService');
const routineRepository = require('../repositories/routineRepository');
const { routineSchema } = require('../validation/routineSchemas');

/**
 * Genera y almacena una rutina personalizada usando IA (un registro por día).
 * La IA devuelve un plan completo, y cada día de entrenamiento se guarda como
 * un registro separado en la base de datos para facilitar su seguimiento.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function generate(req, res) {
  const userId = req.userId;
  const { userProfile, goal } = req.body;
  
  try {
    // 1. Generar el JSON COMPLETO
    const routineJson = await aiService.generateRoutine(userProfile, goal);

    const planName = routineJson.name || 'Rutina Generada';
    const description = routineJson.description || '';

    const createdRoutineIds = [];

    // 2. Guardar cada 'workout' (sesión) como un registro separado
    for (const workout of routineJson.workouts) {
      // Creamos un JSON que representa SOLO la sesión de ese día
      const workoutSession = {
        day: workout.day,
        focus: workout.focus,
        exercises: workout.exercises,
        description: description,
      }; 

      const newRoutineId = await routineRepository.createWorkoutSessionRoutine(
        userId,
        planName,
        workout.day,
        workoutSession, 
      );

      createdRoutineIds.push(newRoutineId);
    } 

    // Devolvemos el JSON original del plan completo para el frontend
    return res.status(201).json(routineJson);
  } catch (err) {
    console.error('Error al generar rutina:', err);
    return res.status(500).json({ error: 'Error interno al generar rutina' });
  }
}

/**
 * Guarda una rutina completa (manual o importada) para el usuario autenticado.
 * Valida la estructura completa de la rutina.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function save(req, res) {
  const { error, value: routineData } = routineSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const userId = req.userId;

  try {
    
    const routineId = await routineRepository.create(
      userId,
      routineData.name,
      routineData.plan_json, 
    );
    return res
      .status(201)
      .json({ message: 'Rutina guardada con éxito', routineId });
  } catch (err) {
    console.error('Error al guardar la rutina:', err);
    return res.status(500).json({ error: 'Error interno al guardar la rutina' });
  }
}

/**
 * Obtiene una rutina específica por ID.
 * Si la rutina es una sesión individual generada por IA, la reformatea
 * para que parezca una rutina completa de 7 días ante el frontend.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getOne(req, res) {
  const routineId = parseInt(req.params.routineId, 10);
  const userId = req.userId;

  if (isNaN(routineId)) {
    return res.status(400).json({ error: 'ID de rutina inválido.' });
  }

  try {
    const routine = await routineRepository.findById(routineId);

    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada.' });
    } 

    if (Number(routine.user_id) !== Number(userId)) {
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    const planData = routine.plan_json;

    // Condición para detectar una sesión individual (generada por la IA)
    if (planData && planData.exercises && !planData.workouts) {
      // Estructura de la sesión individual generada por la IA
      const responseData = {
        id: routine.id,
        user_id: routine.user_id,
        name: routine.name,
        created_at: routine.created_at,
        // Envolvemos el JSON de la sesión individual en el array 'workouts'
        plan_json: {
          name: routine.name,
          description:
            planData.description || 'Sesión de entrenamiento individual.',
          workouts: [
            planData, // El objeto de la sesión individual
          ],
        },
      };
      return res.status(200).json(responseData);
    } 

    // Si es una rutina completa (formato antiguo o manual)
    return res.status(200).json(routine);
  } catch (err) {
    console.error('Error al obtener la rutina:', err);
    return res
      .status(500)
      .json({ error: 'Error interno al obtener la rutina.' });
  }
}

/**
 * Obtiene todas las rutinas del usuario autenticado.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getMine(req, res) {
  const userId = req.userId;

  try {
    const routines = await routineRepository.findByUserId(userId);
    return res.status(200).json(routines);
  } catch (err) {
    console.error('Error al obtener las rutinas del usuario:', err);
    return res
      .status(500)
      .json({ error: 'Error interno al obtener las rutinas' });
  }
}

/**
 * Actualiza el plan_json y el nombre de una rutina existente.
 * Requiere que el usuario sea el propietario de la rutina.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function updateRoutine(req, res) {
  try {
    const routineId = parseInt(req.params.id, 10);
    const userId = req.userId;
    const { name, plan_json } = req.body;

    if (isNaN(routineId) || !name || !plan_json) {
      return res
        .status(400)
        .json({ message: 'ID de rutina, nombre y plan JSON son obligatorios.' });
    }

    // 1. Verificación de propiedad
    const routineCheck = await routineRepository.findById(routineId);
    if (!routineCheck || Number(routineCheck.user_id) !== Number(userId)) {
      return res
        .status(403)
        .json({ error: 'Acceso denegado o rutina no encontrada.' });
    }

    // 2. Actualizar en el repositorio
    const updatedRoutine = await routineRepository.updatePlanJson(
      routineId,
      name,
      plan_json,
    );

    if (!updatedRoutine) {
      return res
        .status(404)
        .json({ message: 'Rutina no encontrada o fallo en la actualización.' });
    }

    res.status(200).json({
      message: 'Rutina actualizada con éxito.',
      routine: updatedRoutine,
    });
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    res
      .status(500)
      .json({ message: 'Error interno del servidor al actualizar la rutina.' });
  }
}

/**
 * Elimina una rutina específica por ID para el usuario autenticado.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function deleteRoutine(req, res) {
  const routineId = parseInt(req.params.id, 10);
  const userId = req.userId;

  if (isNaN(routineId)) {
    return res.status(400).json({ error: 'ID de rutina inválido.' });
  }

  try {
    // 1. Verificar existencia y propiedad
    const routineCheck = await routineRepository.findById(routineId);

    if (!routineCheck) {
      return res.status(404).json({ error: 'Rutina no encontrada.' });
    }
    
    // Verificar que el usuario sea el dueño
    if (Number(routineCheck.user_id) !== Number(userId)) {
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    // 2. Eliminar
    const deletedRows = await routineRepository.deleteById(routineId);

    if (deletedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Rutina no encontrada o ya eliminada.' });
    }

    return res.status(200).json({ message: 'Rutina eliminada con éxito.' });
  } catch (err) {
    console.error('Error al eliminar la rutina:', err);
    return res
      .status(500)
      .json({ error: 'Error interno al eliminar la rutina.' });
  }
}

module.exports = {
  generate,
  save,
  getMine,
  getOne,
  updateRoutine,
  deleteRoutine,
};
