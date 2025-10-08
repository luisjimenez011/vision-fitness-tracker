/**
 * @typedef {Object} Exercise
 * @property {string} name - Nombre del ejercicio
 * @property {number} sets - Número de series
 * @property {string} reps - Repeticiones (ej. '8-12')
 *
 * @typedef {Object} Workout
 * @property {string} day - Día de la rutina
 * @property {string} focus - Grupo muscular o enfoque (ej. 'Pecho/Tríceps')
 * @property {Exercise[]} exercises - Lista de ejercicios
 *
 * @typedef {Object} Routine
 * @property {string} name - Nombre corto de la rutina
 * @property {string} description - Breve descripción
 * @property {Workout[]} workouts - Arreglo de workouts
 */
