const aiService = require('../services/aiService')
const routineRepository = require('../repositories/routineRepository')
const { routineSchema } = require('../validation/routineSchemas')

/**
 * Genera y almacena una rutina personalizada usando IA (un registro por día).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function generate(req, res) {
  const userId = req.userId 
  const { userProfile, goal } = req.body
  
  try {
    // 1. Generar el JSON COMPLETO (contiene el array workouts)
    const routineJson = await aiService.generateRoutine(userProfile, goal)

    const planName = routineJson.name || 'Rutina Generada'; 
    const description = routineJson.description || '';

    const createdRoutineIds = []

    // 2. ITERACIÓN CLAVE: Guardar cada 'workout' como un registro separado en la BD
    for (const workout of routineJson.workouts) {
      
      // Creamos un JSON que representa SOLO la sesión de ese día
      const workoutSession = {
          day: workout.day,
          focus: workout.focus,
          exercises: workout.exercises,
          description: description // Incluimos la descripción general
      };

      // Llamada a la NUEVA función de repositorio
      const newRoutineId = await routineRepository.createWorkoutSessionRoutine(
        userId,
        planName, 
        workout.day, 
        workoutSession // JSON del día
      );
      
      createdRoutineIds.push(newRoutineId);
    }
    
    // Devolvemos el JSON original
    return res.status(201).json(routineJson) 
    
  } catch (err) {
    console.error('Error al generar rutina:', err)
    return res.status(500).json({ error: 'Error interno al generar rutina' })
  }
}

/**
 * Guarda una rutina para el usuario autenticado. (Función de guardado manual, se mantiene)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function save(req, res) {
  const { error, value: routineData } = routineSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }

  const userId = req.userId // Obtenido del middleware verifyToken

  try {
    // Usamos la función 'create' original (para planes completos o manuales)
    const routineId = await routineRepository.create(
      userId,
      routineData.name,
      routineData,
    )
    return res
      .status(201)
      .json({ message: 'Rutina guardada con éxito', routineId })
  } catch (err) {
    console.error('Error al guardar la rutina:', err)
    return res.status(500).json({ error: 'Error interno al guardar la rutina' })
  }
}

/**
 * Obtiene una rutina específica por ID y la reformatea si es una sesión individual.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getOne(req, res) {
  const routineId = parseInt(req.params.routineId, 10);
  const userId = req.userId; // Viene del token JWT

  if (isNaN(routineId)) {
    return res.status(400).json({ error: 'ID de rutina inválido.' });
  }

  try {
    const routine = await routineRepository.findById(routineId);

    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada.' });
    }

    // La verificación de propiedad es correcta
    if (Number(routine.user_id) !== Number(userId)) { 
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    // 🛑 REFORMATEO CLAVE: Si el plan_json no tiene .workouts, es una sesión individual
    const planData = routine.plan_json;

    if (planData && planData.exercises && !planData.workouts) {
        // Estructura de la sesión individual generada por la IA
        const responseData = {
            id: routine.id,
            user_id: routine.user_id,
            name: routine.name, // Ya contiene el nombre combinado (Plan - Día 1)
            created_at: routine.created_at,
            // Envolvemos el JSON de la sesión individual en el array 'workouts'
            // para que el frontend (RoutineDetailPage y TrackingPage) lo entienda:
            plan_json: {
                name: routine.name,
                description: planData.description || 'Sesión de entrenamiento individual.',
                workouts: [
                    planData // El objeto de la sesión individual (day, focus, exercises)
                ]
            }
        };
        return res.status(200).json(responseData);
    }
    
    // Si no necesita reformateo (es una rutina antigua o manual con el formato completo)
    return res.status(200).json(routine);
  } catch (err) {
    console.error('Error al obtener la rutina:', err);
    return res.status(500).json({ error: 'Error interno al obtener la rutina.' });
  }
}

/**
 * Obtiene todas las rutinas del usuario autenticado.
 */
async function getMine(req, res) {
  const userId = req.userId; 

  try {
    const routines = await routineRepository.findByUserId(userId);
    return res.status(200).json(routines);
  } catch (err) {
    console.error('Error al obtener las rutinas del usuario:', err);
    return res.status(500).json({ error: 'Error interno al obtener las rutinas' });
  }
}

/**
 * Actualiza el plan_json y el nombre de una rutina existente.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function updateRoutine(req, res) {
    try {
        const routineId = parseInt(req.params.id, 10);
        const userId = req.userId;
        // Esperamos que el frontend envíe el nuevo nombre y el plan JSON completo
        const { name, plan_json } = req.body; 

        if (isNaN(routineId) || !name || !plan_json) {
            return res.status(400).json({ message: 'ID de rutina, nombre y plan JSON son obligatorios.' });
        }
        
        // 1. Verificación de propiedad (opcional pero muy recomendable)
        const routineCheck = await routineRepository.findById(routineId);
        if (!routineCheck || Number(routineCheck.user_id) !== Number(userId)) {
            return res.status(403).json({ error: 'Acceso denegado o rutina no encontrada.' });
        }


        // 2. Actualizar en el repositorio
        const updatedRoutine = await routineRepository.updatePlanJson(
            routineId,
            name,
            plan_json
        );

        if (!updatedRoutine) {
            // Esto solo ocurriría si findById pasara y updatePlanJson fallara, pero es bueno tenerlo
            return res.status(404).json({ message: 'Rutina no encontrada o fallo en la actualización.' });
        }

        res.status(200).json({ 
            message: 'Rutina actualizada con éxito.', 
            routine: updatedRoutine 
        });

    } catch (error) {
        console.error('Error al actualizar rutina:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la rutina.' });
    }
}

module.exports = {
  generate,
  save,
  getMine,
  getOne,
  updateRoutine,
}