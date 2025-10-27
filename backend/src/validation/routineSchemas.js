const Joi = require('joi');

const exerciseSchema = Joi.object({
  name: Joi.string().required(),
  sets: Joi.alternatives().try(Joi.string(), Joi.number()).required(), 
  reps: Joi.alternatives().try(Joi.string(), Joi.number()).required(), 
  notes: Joi.string().optional().allow(''),
});

const dayScheduleSchema = Joi.object({
  day: Joi.string().required(),
  focus: Joi.string().optional().allow(null, ''), 
  exercises: Joi.array().items(exerciseSchema).required(),
});

const routineSchema = Joi.object({
  name: Joi.string().required(), 
  workouts: Joi.array().items(dayScheduleSchema).required(), 
  description: Joi.string().optional().allow(null, ''), 
  plan_json: Joi.object().optional(),
});

module.exports = {
  routineSchema,
};