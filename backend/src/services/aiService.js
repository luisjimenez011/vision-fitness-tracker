const { GoogleGenAI } = require('@google/genai')

// Función auxiliar para obtener el cliente de IA de forma segura
function getGeminiClient() {
  // NOTA: En un entorno de servidor real, la clave API debe estar en process.env.
  // Aquí asumimos que el entorno de ejecución ya la proporciona.
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    // Esto es vital para detener el servicio si la configuración es incorrecta
    throw new Error(
      'GEMINI_API_KEY no configurada. Por favor, revisa tu archivo .env.',
    )
  }
  return new GoogleGenAI({ apiKey })
}

/**
 * Genera una rutina personalizada usando Gemini (Google GenAI).
 * @param {Object} userProfile - Perfil del usuario (edad, nivel, etc.)
 * @param {string} goal - Objetivo del usuario (ej. perder peso, ganar músculo)
 * @returns {Promise<Object>} Objeto rutina generado por IA en formato JSON.
 */
async function generateRoutine(userProfile, goal) {
  try {
    const genAI = getGeminiClient()

    // El prompt incluye la estructura JSON
    const prompt = ` Eres un **Entrenador Personal de Élite** y **Experto en Ciencias del Deporte**. Tu principal responsabilidad es generar una rutina de entrenamiento semanal de alta calidad y perfectamente adaptada.

        **INSTRUCCIONES CLAVE:**
        1. **FORMATO ESTRICTO DE SALIDA:** La respuesta debe ser **SOLO** un objeto JSON. **No incluyas explicaciones, encabezados Markdown (como \`\`\`json), o texto antes o después del objeto.**
        2. **Rol Experto:** La rutina debe ser **inteligente, progresiva y segura**, alineada con el objetivo principal del usuario.
        3. **Base de Datos:** Utiliza toda la información proporcionada por el usuario (Objetivo, Nivel, Frecuencia, Equipo, etc.) del formulario.
        4. **RESTRICCIÓN DE DÍAS ÚNICOS:** Si se solicita más de un día, la rutina DEBE utilizar una **división de entrenamiento lógica** basada en el perfil del usuario (ej. basate tu en la ciencia. 'Full Body', 'Torso/Pierna', 'PPL'). Cada entrada del array 'workouts' debe tener un valor **ÚNICO, DESCRIPTIVO y DIFERENTE** en la clave **'day'** (ejemplo basate en tus conocimientos: 'Día 1: Torso' y 'Día 2: Pierna').

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

    // 2. Configuración del modelo para forzar la salida JSON
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json', // <--- ¡CLAVE! Asegura que la respuesta sea JSON.
        temperature: 0.8,
      },
    })

    // 3. Extracción y Parsing
    const jsonString = response.text.trim()

    // El SDK con responseMimeType debería garantizar un JSON válido
    return JSON.parse(jsonString)
  } catch (err) {
    console.error('Error al comunicarse con la API de Gemini:', err.message)
    throw new Error(
      'Fallo en la generación de rutina por error de la API de IA.',
    )
  }
}

/**
 * Analiza los datos de volumen y perfil del usuario para generar un informe de progreso.
 * @param {Array<Object>} aggregatedVolumeData - Datos de volumen agrupados por ejercicio y mes (incluye averageWeight).
 * @param {Object} userProfile - Perfil del usuario (objetivo, nivel, etc.).
 * @returns {Promise<string>} El análisis de texto generado por la IA.
 */
async function analyzeVolumeProgress(aggregatedVolumeData, userProfile) {
    try {
        const genAI = getGeminiClient()
        
        // 1. Convertir los datos de volumen a una cadena JSON para el prompt
        const volumeDataString = JSON.stringify(aggregatedVolumeData, null, 2);

        // 2. Construir el prompt de ingeniería
        const prompt = `
            Eres un entrenador personal y analista de datos experto.
            Tu objetivo es analizar la progresión de volumen de entrenamiento de un usuario para optimizar la hipertrofia.
            
            --- PERFIL DEL USUARIO ---
            Objetivo principal: ${userProfile?.goal || 'Ganar músculo y fuerza.'}
            Nivel: ${userProfile?.level || 'Intermedio.'}
            
            --- DATOS AGREGADOS DE VOLUMEN (Mes a Mes) ---
            Cada objeto incluye: monthYear, exerciseName, totalVolume, totalReps y el nuevo y crucial averageWeight (Peso Promedio Levantado).
            ${volumeDataString}
            
            --- INSTRUCCIONES DE ANÁLISIS ---
            1. **Resumen y Tendencia General:** Identifica la tendencia del Volumen Total.
            2. **Análisis de Intensidad (CLAVE):** Para los ejercicios más importantes, evalúa si el aumento de volumen está siendo impulsado por la **fuerza/intensidad** (aumento del 'averageWeight') o solo por la **cantidad** (aumento de 'totalReps').
            3. **Ejercicios Clave:** Señala el o los ejercicios con mejor progresión de **fuerza (averageWeight)** y el o los que están estancados en ese aspecto.
            4. **Recomendación:** Ofrece un consejo práctico y conciso basado en la progresión de intensidad para el próximo mes.
            
            El análisis debe ser motivador, profesional y NO debe exceder los 3 párrafos. Usa español.
        `;

        // 3. Llamada a la API de IA 
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                temperature: 0.5,
            },
        });

        // Retorna el texto generado
        return response.text; 

    } catch (error) {
        console.error('Error en el servicio de análisis de IA:', error);
        return "Lo siento, no pude generar el análisis de progreso. Por favor, verifica la configuración de la clave de API o los datos de logs.";
    }
}

/**
 * Utiliza la IA para clasificar dinámicamente una lista de ejercicios
 * en grupos musculares principales.
 * @param {Array<string>} uniqueExerciseNames - Lista de nombres de ejercicios únicos.
 * @returns {Promise<Object>} Objeto JSON mapeando { "Ejercicio": "GrupoMuscular" }.
 */
async function classifyExercisesByMuscle(uniqueExerciseNames) {
    const genAI = getGeminiClient();

    const muscleGroups = [
        "Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio", "Otros"
    ];

    const prompt = `
        Eres un experto en biomecánica y fitness.
        Tu tarea es clasificar la siguiente lista de nombres de ejercicios en los grupos musculares principales proporcionados.

        INSTRUCCIONES CLAVE:
        1. La respuesta debe ser SOLO un objeto JSON. NO incluyas explicaciones ni texto adicional.
        2. El objeto JSON debe tener el formato: { "NombreDelEjercicio": "GrupoMuscular" }.
        3. Si un ejercicio trabaja varios grupos, clasifícalo en el grupo PRIMARIO.
        4. Si es un ejercicio de acondicionamiento (correr, saltar la cuerda), usa "Cardio". Si es irrelevante, usa "Otros".

        GRUPOS MUSCULARES PERMITIDOS: ${muscleGroups.join(', ')}

        LISTA DE EJERCICIOS A CLASIFICAR:
        ${JSON.stringify(uniqueExerciseNames)}
    `;

    const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            responseMimeType: 'application/json',
            temperature: 0.1, // Baja temperatura para una clasificación precisa
        },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString); // Esto será el MUSCLE_MAP dinámico
}

/**
 * Analiza el volumen agregado, clasifica los ejercicios usando IA, y genera un análisis del balance muscular.
 *
 * @param {Array<Object>} aggregatedVolume - Datos de volumen por ejercicio (del repositorio)
 * @returns {Promise<{muscleVolume: Object, aiAnalysis: string}>}
 */
async function analyzeMuscleMap(aggregatedVolume) {
    // Inicializar el cliente de la IA en el ámbito de la función
    const genAI = getGeminiClient(); 

    if (!aggregatedVolume || aggregatedVolume.length === 0) {
        return { muscleVolume: {}, aiAnalysis: "No hay datos de volumen para analizar." };
    }

    // 1. Obtener la lista única de ejercicios del log
    const uniqueExerciseNames = [...new Set(aggregatedVolume.map(item => item.exerciseName))];

    // 2. Usar la IA para clasificar estos ejercicios dinámicamente
    let dynamicMuscleMap;
    try {
        dynamicMuscleMap = await classifyExercisesByMuscle(uniqueExerciseNames);
    } catch (e) {
        console.error("Fallo al clasificar ejercicios con IA. Usando 'Otros' como fallback:", e.message);
        // Fallback: Si la IA falla, usamos un mapeo marcando todo como 'Otros'
        dynamicMuscleMap = uniqueExerciseNames.reduce((map, name) => ({ ...map, [name]: 'Otros' }), {});
    }

    // 3. Mapeo de Volumen por Músculo usando el mapa dinámico
    const muscleVolume = {};
    let totalGlobalVolume = 0;

    aggregatedVolume.forEach(item => {
        const exerciseName = item.exerciseName;
        // Si el ejercicio no está en el mapa dinámico (ej. por falla parcial), usamos 'Otros'
        const muscleGroup = dynamicMuscleMap[exerciseName] || 'Otros'; 
        const volume = item.totalVolume;

        muscleVolume[muscleGroup] = (muscleVolume[muscleGroup] || 0) + volume;
        totalGlobalVolume += volume;
    });

    // 4. ANÁLISIS DE IA DETALLADO DEL BALANCE MUSCULAR
    let analysisMessage;

    if (totalGlobalVolume === 0) {
        analysisMessage = "No hay datos de entrenamiento suficientes para analizar el mapa muscular.";
    } else {
        const muscleDataString = JSON.stringify(muscleVolume);

        const prompt = `
            Eres un entrenador de fuerza y acondicionamiento (S&C) experto, y tu objetivo es generar un análisis de balance muscular. Analiza el siguiente balance de volumen de entrenamiento (en kg) por grupo muscular en el último periodo.

            Datos de Volumen Muscular: ${muscleDataString}

            Instrucciones para la IA:
            1. **Identifica el músculo con mayor volumen** (el más entrenado).
            2. **Evalúa el balance general** entre grupos musculares opuestos (Pecho vs. Espalda, Cuádriceps vs. Isquiotibiales (si están separados), Bíceps vs. Tríceps) para identificar posibles descompensaciones. Indica si el balance es adecuado o necesita ajuste.
            3. **Proporciona una recomendación de entrenamiento específica** y procesable (actionable) basada en el desequilibrio encontrado, sugiriendo un enfoque para el próximo mes (ej. "Añade 1-2 series más de ejercicios de tracción horizontal la próxima semana.").

            FORMATO DE RESPUESTA REQUERIDO:
            Comienza con un resumen de una sola frase. Luego, usa saltos de línea doble para separar los puntos 1, 2 y 3.
            Necesito que el análisis sea conciso, legible y motivador, con una extensión total no superior a 4-5 frases.
        `;

        try {
            // Utilizamos genAI (el cliente inicializado) para la llamada
            const response = await genAI.models.generateContent({ 
                model: "gemini-2.5-flash", 
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.5, 
                },
            });
            analysisMessage = response.text.trim();

        } catch (error) {
            console.error("Error al obtener el análisis de IA:", error);
            analysisMessage = "⚠️ Error del servidor de IA. No se pudo generar el análisis de balance muscular.";
        }
    }

    // 5. Devolver los resultados
    return {
        muscleVolume: muscleVolume,
        aiAnalysis: analysisMessage
    };
}

module.exports = {
  generateRoutine,
  analyzeVolumeProgress,
  classifyExercisesByMuscle,
  analyzeMuscleMap,
}