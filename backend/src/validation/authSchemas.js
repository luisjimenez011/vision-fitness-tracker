const Joi = require('joi')

/**
 * Esquema de validación para el registro de usuario.
 * @type {Joi.ObjectSchema<{name: string, email: string, password: string}>}
 */
const UserRegistrationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

module.exports = {
  UserRegistrationSchema
}
