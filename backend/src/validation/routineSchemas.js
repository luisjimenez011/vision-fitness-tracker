const Joi = require('joi');

const exerciseSchema = Joi.object({
  name: Joi.string().required(),
  sets: Joi.alternatives().try(Joi.string(), Joi.number()).required(), 
  reps: Joi.alternatives().try(Joi.string(), Joi.number()).required(), 
  notes: Joi.string().optional().allow(''), // Asegúrate de que este campo exista si tu IA lo incluye.
});

const dayScheduleSchema = Joi.object({
  day: Joi.string().required(),
  focus: Joi.string().optional().allow(null, ''), // Incluye el campo 'focus' si está en el JSON de Gemini
  exercises: Joi.array().items(exerciseSchema).required(),
});

const routineSchema = Joi.object({
  // CAMBIO 1: Debe ser 'name' para coincidir con el JSON real de Gemini
  name: Joi.string().required(), 
  
  // CAMBIO 2: Debe ser 'workouts' para coincidir con el JSON real de Gemini
  workouts: Joi.array().items(dayScheduleSchema).required(), 
  
  // Opcional: Si Gemini incluye una descripción, añádela
  description: Joi.string().optional().allow(null, ''), 
});

module.exports = {
  routineSchema,
};