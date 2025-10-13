const { GoogleGenAI } = require('@google/genai');

/**
 * Genera una rutina personalizada usando Gemini (Google GenAI).
 * * @param {Object} userProfile - Perfil del usuario (edad, nivel, etc.)
 * @param {string} goal - Objetivo del usuario (ej. perder peso, ganar músculo)
 * @returns {Promise<Object>} Objeto rutina generado por IA en formato JSON.
 */
async function generateRoutine(userProfile, goal) {
    // 1. Verificación de la API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY no configurada. Por favor, revisa tu archivo .env.');
    }

    try {
        const genAI = new GoogleGenAI({ apiKey });
        
        // El prompt incluye la estructura JSON
        const prompt = `Eres un entrenador personal experto y responsable. Tu tarea es generar una rutina de entrenamiento, adaptada al siguiente perfil y objetivo Teniendo en cuenta los datos proporcionados por el Usuario. La respuesta debe ser SOLO un objeto JSON que siga exactamente esta estructura:

{
  "name": "string", 
  "description": "string", 
  "workouts": [
    {
      "day": "string", 
      "focus": "string", 
      "exercises": [
        {
          "name": "string", 
          "sets": "number", 
          "reps": "string" 
        }
      ]
    }
  ]
}

### PERFIL DE USUARIO
${JSON.stringify(userProfile)}

### OBJETIVO
${goal}
`;

        // 2. Configuración del modelo para forzar la salida JSON (mayor fiabilidad)
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json', // <--- ¡CLAVE! Asegura que la respuesta sea JSON.
                temperature: 0.8,
            },
        });

        // 3. Extracción y Parsing
        // El SDK devuelve el JSON en response.text
        const jsonString = response.text.trim();
        
        // El SDK garantiza un JSON válido si responseMimeType es usado, pero es bueno tener el try/catch
        return JSON.parse(jsonString);

    } catch (err) {
        // Manejo de errores de la API (ej. API Key incorrecta o error en la generación)
        console.error('Error al comunicarse con la API de Gemini:', err.message);
        
        // Lanzamos un error más claro para que el Controller lo capture y devuelva el 500
        throw new Error('Fallo en la generación de rutina por error de la API de IA.');
    }
}

module.exports = {
    generateRoutine
};