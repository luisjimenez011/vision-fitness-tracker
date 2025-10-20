import React from 'react';

// Mapeo: Grupo Muscular (del backend) -> ID(s) de la(s) parte(s) SVG
// Las IDs deben coincidir con las definidas dentro del SVG
const MUSCLE_TO_SVG_MAP = {
    'Pecho': ['chest', 'pecs'],
    'Espalda': ['back', 'lats'],
    'Piernas': ['quads', 'hamstrings', 'calves'],
    'Hombros': ['shoulders', 'delts'],
    'Bíceps': ['biceps'],
    'Tríceps': ['triceps'],
    'Core': ['abs'],
    'Otros': ['forearms', 'neck'], // Músculos secundarios o misceláneos
    'Cardio': [], // No se visualiza directamente en el mapa
};

// Función auxiliar para calcular el color basado en el volumen (copiar del paso 1)
const getColorIntensity = (volume, maxVolume) => {
    if (volume === 0 || !volume) return '#e0e0e0'; // Gris claro

    const normalizedVolume = maxVolume > 0 ? volume / maxVolume : 0;
    
    // Usaremos un tono de rojo/naranja (más intenso para el volumen alto)
    // HSL (Hue, Saturation, Lightness) es bueno para esto.
    // H: 15 (Naranja), S: 80%, L: 50%
    const hue = 15; // Naranja/Rojo
    const saturation = 80; // 80%
    
    // La luminosidad varía: menor luminosidad (más oscuro) = más volumen
    // Vamos de 90% (claro, bajo volumen) a 40% (oscuro, alto volumen)
    const lightness = 90 - (normalizedVolume * 50); 

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


/**
 * Componente que renderiza un mapa corporal con colores de intensidad.
 * @param {Object} props
 * @param {Object} props.data - Objeto de volumen muscular {GrupoMuscular: volumen}
 * @param {string} props.title - Título a mostrar
 */
const BodyMap = ({ data = {}, title = "Balance Muscular (Últimos 30 Días)" }) => {
    // 1. Encontrar el volumen máximo para la normalización
    const volumes = Object.values(data).filter(v => typeof v === 'number');
    const maxVolume = volumes.length > 0 ? Math.max(...volumes) : 1;
    
    // 2. Mapear grupos musculares a colores
    const muscleColors = {};
    Object.keys(data).forEach(group => {
        muscleColors[group] = getColorIntensity(data[group], maxVolume);
    });

    // 3. Función para obtener el color de una parte SVG
    const getPartColor = (muscleGroupName) => {
        return muscleColors[muscleGroupName] || '#e0e0e0';
    };

    // 4. Mapear los colores a las partes SVG, basándose en MUSCLE_TO_SVG_MAP
    // (Esto se haría más eficientemente con una librería de SVG compleja, 
    // pero para este ejemplo, usaremos un SVG estático).

    // --- SVG SIMPLIFICADO DEL CUERPO HUMANO ---
    // (Nota: Este SVG es una representación simplificada para fines de demostración. 
    // Una implementación real usaría un archivo SVG mucho más detallado.)
    const BodySVG = () => (
        <svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <title>{title}</title>
            <g transform="translate(100, 50)" fill="#e0e0e0" stroke="#333" strokeWidth="2">
                
                {/* Cabeza y Tronco Central (sin coloración dinámica) */}
                <circle cx="100" cy="50" r="30" fill="#fcfcfc" /> 
                <rect x="70" y="80" width="60" height="150" rx="10" />

                {/* Pecho (Pecho) */}
                <path id="chest" d="M100 80 L130 110 V150 H70 V110 Z" 
                    fill={getPartColor('Pecho')} />

                {/* Abs (Core) */}
                <rect id="abs" x="75" y="150" width="50" height="50" rx="5" 
                    fill={getPartColor('Core')} />

                {/* Hombros */}
                <circle id="shoulders" cx="65" cy="110" r="15" fill={getPartColor('Hombros')} />
                <circle id="shoulders" cx="135" cy="110" r="15" fill={getPartColor('Hombros')} />

                {/* Brazos (Bíceps y Tríceps) */}
                {/* Brazo Izq. */}
                <rect id="biceps" x="40" y="120" width="10" height="80" rx="5" 
                    fill={getPartColor('Bíceps')} transform="rotate(10, 50, 160)" />
                {/* Brazo Der. */}
                <rect id="triceps" x="150" y="120" width="10" height="80" rx="5" 
                    fill={getPartColor('Tríceps')} transform="rotate(-10, 160, 160)" />

                {/* Espalda (General - asumiendo la vista frontal es solo una estimación) */}
                {/* En una vista trasera, estas IDs se usarían mejor */}
                <rect id="lats" x="50" y="80" width="100" height="150" rx="10" opacity="0" /> 
                
                {/* Piernas */}
                {/* Muslos (Quads/Hamstrings) */}
                <rect id="quads" x="75" y="230" width="20" height="150" rx="10" 
                    fill={getPartColor('Piernas')} />
                <rect id="hamstrings" x="105" y="230" width="20" height="150" rx="10" 
                    fill={getPartColor('Piernas')} />
                
                {/* Pantorrillas (Calves) */}
                <rect id="calves" x="75" y="390" width="20" height="100" rx="8" 
                    fill={getPartColor('Piernas')} />
                <rect id="calves" x="105" y="390" width="20" height="100" rx="8" 
                    fill={getPartColor('Piernas')} />

                {/* Leyenda Simple */}
                <text x="0" y="550" fontSize="14" fill="#333">
                    Intensidad: {maxVolume.toFixed(0)} kg (Máximo)
                </text>
            </g>
        </svg>
    );

    return (
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
            <div className="w-48">
                <BodySVG />
            </div>
            <div className="mt-4 text-sm text-gray-600">
                <p>El volumen total de entrenamiento se normaliza para colorear el mapa.</p>
                <p>Máx. Volumen registrado: **{maxVolume.toLocaleString()}** kg</p>
            </div>
        </div>
    );
};

export default BodyMap;