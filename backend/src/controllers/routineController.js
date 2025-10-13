const aiService = require('../services/aiService')
const routineRepository = require('../repositories/routineRepository')
const { routineSchema } = require('../validation/routineSchemas')

/**
 * Genera y almacena una rutina personalizada usando IA.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function generate(req, res) {
  // Simulación de autenticación: userId fijo
  const userId = req.userId // **NOTA: Esto debería ser req.userId una vez se use el middleware**
  const { userProfile, goal } = req.body
  try {
    const routineJson = await aiService.generateRoutine(userProfile, goal)

    // --- CORRECCIÓN CLAVE ---
    // 1. Asegúrate de que routineJson tiene un campo 'routine_name'
    const routineName = routineJson.name || 'Rutina Generada'; 

    // 2. Pasar los tres argumentos requeridos: userId, name, planJson
    await routineRepository.create(userId, routineName, routineJson) // -----------------------
    return res.status(201).json(routineJson)
  } catch (err) {
    console.error('Error al generar rutina:', err)
    return res.status(500).json({ error: 'Error interno al generar rutina' })
  }
}

/**
 * Guarda una rutina para el usuario autenticado.
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
    // CORRECCIÓN CLAVE: Usar routineData.name (validado por Joi)
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
 * Obtiene todas las rutinas del usuario autenticado.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getMine(req, res) {
  const userId = req.userId; // Asumimos que el middleware de autenticación ya añadió esto

  try {
    const routines = await routineRepository.findByUserId(userId);
    return res.status(200).json(routines);
  } catch (err) {
    console.error('Error al obtener las rutinas del usuario:', err);
    return res.status(500).json({ error: 'Error interno al obtener las rutinas' });
  }
}

module.exports = {
  generate,
  save,
  getMine,
}
