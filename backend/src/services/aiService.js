const { GoogleGenAI } = require('@google/genai')

/**
 * Genera una rutina personalizada usando Gemini (Google GenAI).
 * * @param {Object} userProfile - Perfil del usuario (edad, nivel, etc.)
 * @param {string} goal - Objetivo del usuario (ej. perder peso, ganar músculo)
 * @returns {Promise<Object>} Objeto rutina generado por IA en formato JSON.
 */
async function generateRoutine(userProfile, goal) {
  // 1. Verificación de la API Key
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY no configurada. Por favor, revisa tu archivo .env.',
    )
  }

  try {
    const genAI = new GoogleGenAI({ apiKey })

    // El prompt incluye la estructura JSON
    const prompt = ` Eres un **Entrenador Personal de Élite** y **Experto en Ciencias del Deporte**. Tu principal responsabilidad es generar una rutina de entrenamiento semanal de alta calidad y perfectamente adaptada.

  **INSTRUCCIONES CLAVE:**
  1. **FORMATO ESTRICTO DE SALIDA:** La respuesta debe ser **SOLO** un objeto JSON. **No incluyas explicaciones, encabezados Markdown (como \`\`\`json), o texto antes o después del objeto.**
  2. **Rol Experto:** La rutina debe ser **inteligente, progresiva y segura**, alineada con el objetivo principal del usuario.
  3. **Base de Datos:** Utiliza toda la información proporcionada por el usuario (Objetivo, Nivel, Frecuencia, Equipo, etc.) del formulario.
  4. **RESTRICCIÓN DE DÍAS ÚNICOS:** Si se solicita más de un día, la rutina DEBE utilizar una **división de entrenamiento lógica** basada en el perfil del usuario (ej basate tu en la ciencia. 'Full Body', 'Torso/Pierna', 'PPL'). Cada entrada del array 'workouts' debe tener un valor **ÚNICO, DESCRIPTIVO y DIFERENTE** en la clave **'day'** (ejemplo basate en tus conocimientos: 'Día 1: Torso' y 'Día 2: Pierna').

  **ESTRUCTURA JSON REQUERIDA (Sigue EXCLUSIVAMENTE esta estructura):**

{
  "name": "string (Título descriptivo de la rutina)", 
  "description": "string (Resumen profesional del enfoque de la rutina)", 
  "workouts": [
    {
      "day": "string (Nombre ÚNICO y DESCRIPTIVO, indicando el foco del entrenamiento, ej basate tu en tus conocimientos: 'Día 1: Pecho/Tríceps', 'Día 2: Pierna')", 
      "focus": "string (El grupo muscular principal o tipo de entrenamiento)", 
      "exercises": [
        {
          "name": "string (Nombre completo del ejercicio)", 
          "sets": "number (Número de series)", 
          "reps": "string (Rango de repeticiones, ej: '8-12')" 
        }
      ]
    }
  ]
}


### PERFIL DE USUARIO
${JSON.stringify(userProfile)}

### OBJETIVO
${goal}
`

    // 2. Configuración del modelo para forzar la salida JSON (mayor fiabilidad)
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json', // <--- ¡CLAVE! Asegura que la respuesta sea JSON.
        temperature: 0.8,
      },
    })

    // 3. Extracción y Parsing
    // El SDK devuelve el JSON en response.text
    const jsonString = response.text.trim()

    // El SDK garantiza un JSON válido si responseMimeType es usado, pero es bueno tener el try/catch
    return JSON.parse(jsonString)
  } catch (err) {
    // Manejo de errores de la API (ej. API Key incorrecta o error en la generación)
    console.error('Error al comunicarse con la API de Gemini:', err.message)

    // Lanzamos un error más claro para que el Controller lo capture y devuelva el 500
    throw new Error(
      'Fallo en la generación de rutina por error de la API de IA.',
    )
  }
}

module.exports = {
  generateRoutine,
}
