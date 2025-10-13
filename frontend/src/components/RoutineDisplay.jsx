import React, { useState, useEffect } from 'react';

/**
 * @typedef {object} Exercise
 * @property {string} name
 * @property {string} sets
 * @property {string} reps
 * @property {string} [notes]
 */

/**
 * @typedef {object} DayWorkout
 * @property {string} day
 * @property {string} focus
 * @property {Exercise[]} exercises
 */

/**
 * @typedef {object} RoutineData
 * @property {string} name // <-- CORRECCIÓN: Usamos 'name' en lugar de 'routine_name'
 * @property {DayWorkout[]} workouts // <-- CORRECCIÓN: Usamos 'workouts' en lugar de 'schedule'
 * @property {string} [description]
 */

/**
 * @param {{
 * routineData: RoutineData;
 * onSave: (updatedRoutine: RoutineData) => void;
 * onGenerateNew: () => void;
 * }} props
 */
const RoutineDisplay = ({ routineData, onSave, onGenerateNew }) => {
    const [editableRoutine, setEditableRoutine] = useState(routineData);

    useEffect(() => {
        setEditableRoutine(routineData);
    }, [routineData]);

    const handleRoutineNameChange = (e) => {
        // CORRECCIÓN: Actualizamos la clave 'name'
        setEditableRoutine({ ...editableRoutine, name: e.target.value });
    };

    const handleExerciseChange = (dayIndex, exerciseIndex, field, value) => {
        // CORRECCIÓN: Usamos 'workouts'
        const updatedWorkouts = [...editableRoutine.workouts];
        updatedWorkouts[dayIndex].exercises[exerciseIndex][field] = value;
        setEditableRoutine({ ...editableRoutine, workouts: updatedWorkouts });
    };

    if (!editableRoutine || !editableRoutine.workouts) { // Manejo de nulo
        return <p>No hay rutina para mostrar o la estructura es inválida.</p>;
    }

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    // CORRECCIÓN: Leer la clave 'name'
                    value={editableRoutine.name}
                    onChange={handleRoutineNameChange}
                    className="text-2xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => onSave(editableRoutine)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Guardar Rutina
                    </button>
                    <button
                        onClick={onGenerateNew}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Generar Nuevo
                    </button>
                </div>
            </div>
            
            {/* Descripción general de la rutina */}
            {editableRoutine.description && (
                <p className="text-gray-600 mb-6 italic">{editableRoutine.description}</p>
            )}


            <div className="space-y-6">
                {/* CORRECCIÓN: Iterar sobre 'workouts' en lugar de 'schedule' */}
                {editableRoutine.workouts.map((day, dayIndex) => (
                    <div key={dayIndex} className="p-4 bg-white rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-1 text-blue-700">{day.day}</h3>
                        <p className="text-sm text-gray-500 mb-3 font-medium">Focus: {day.focus}</p>

                        <div className="space-y-4">
                            {day.exercises.map((exercise, exerciseIndex) => (
                                <div key={exerciseIndex} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                                    {/* Nombre del Ejercicio */}
                                    <input
                                        type="text"
                                        value={exercise.name}
                                        onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'name', e.target.value)}
                                        className="text-lg font-medium text-gray-800 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-400 w-full"
                                    />
                                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                                        {/* Sets */}
                                        <span>
                                            Sets:
                                            <input
                                                type="text"
                                                value={exercise.sets}
                                                onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'sets', e.target.value)}
                                                className="ml-2 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-400 w-16"
                                            />
                                        </span>
                                        {/* Reps */}
                                        <span>
                                            Reps:
                                            <input
                                                type="text"
                                                value={exercise.reps}
                                                onChange={(e) => handleExerciseChange(dayIndex, exerciseIndex, 'reps', e.target.value)}
                                                className="ml-2 bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-400 w-24"
                                            />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoutineDisplay;