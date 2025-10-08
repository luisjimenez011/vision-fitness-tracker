const aiService = require('../services/aiService')
const routineRepository = require('../repositories/routineRepository')

/**
 * Genera y almacena una rutina personalizada usando IA.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function generate(req, res) {
  // Simulación de autenticación: userId fijo
  const userId = 1
  const { userProfile, goal } = req.body
  try {
    const routineJson = await aiService.generateRoutine(userProfile, goal)
    await routineRepository.create(userId, routineJson)
    return res.status(201).json(routineJson)
  } catch (err) {
    console.error('Error al generar rutina:', err)
    return res.status(500).json({ error: 'Error interno al generar rutina' })
  }
}

module.exports = {
  generate
}
