import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// =========================================================================
// DEFINICIÓN DE MÉTRICAS
// Las claves ('totalVolume', 'totalDuration', etc.) DEBEN coincidir con los datos MAPPEDOS
// en ProfilePage.jsx.
// =========================================================================
const METRIC_DETAILS = {
    // Métricas principales (seleccionables por el usuario)
    'totalVolume': { name: 'Volumen Total', unit: 'kg', color: '#007AFF', yAxisId: 'main' },
    'totalDuration': { name: 'Duración Total', unit: 'min', color: '#FF9500', yAxisId: 'main' },
    'totalReps': { name: 'Total Repeticiones', unit: 'reps', color: '#34C759', yAxisId: 'main' },
    // Métrica secundaria (siempre visible en el eje secundario)
    'totalWorkouts': { name: 'Entrenamientos Completados', unit: 'entrenos', color: '#999999', yAxisId: 'secondary' }, 
};

// =========================================================================
// Función de Tooltip Personalizado
// =========================================================================
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ 
                padding: '10px', 
                backgroundColor: 'rgba(44, 62, 80, 0.95)',
                border: '1px solid #34495e', 
                borderRadius: '5px', 
                color: 'white',
                fontSize: '14px'
            }}>
                <p className="font-bold text-base mb-1">{label}</p>
                {payload.map((item, index) => {
                    const detail = METRIC_DETAILS[item.dataKey];
                    const unit = detail ? detail.unit : '';
                    
                    return (
                        <p key={index} style={{ color: item.color }} className="capitalize">
                            {item.name}: {item.value.toLocaleString('es-ES')} {unit}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};


/**
 * Componente de gráfico de línea para la progresión global mensual.
 */
const ProfileChart = ({ data, selectedMetric }) => {
    
    const mainMetric = METRIC_DETAILS[selectedMetric];

    if (!mainMetric) return <div>Métrica de gráfica no válida.</div>;

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    
                    {/* Eje X (Mes/Año) - Usa la clave 'month' (mapeada en ProfilePage) */}
                    <XAxis 
                        dataKey="month" 
                        stroke="#333" 
                        angle={-15} 
                        textAnchor="end" 
                        height={50}
                    />
                    
                    {/* Eje Y PRINCIPAL (Dinámico) */}
                    <YAxis 
                        yAxisId="main" 
                        stroke={mainMetric.color}
                        label={{ 
                            value: `${mainMetric.name} (${mainMetric.unit})`,
                            angle: -90, 
                            position: 'insideLeft', 
                            fill: mainMetric.color, 
                            dy: 20,
                            style: { fontWeight: 'bold' }
                        }} 
                    />
                    
                    {/* Eje Y SECUNDARIO (Fijo: Entrenamientos) */}
                    <YAxis 
                        yAxisId="secondary" 
                        orientation="right" 
                        stroke={METRIC_DETAILS.totalWorkouts.color} 
                        label={{ 
                            value: `${METRIC_DETAILS.totalWorkouts.name}`, 
                            angle: 90, 
                            position: 'insideRight', 
                            fill: METRIC_DETAILS.totalWorkouts.color, 
                            dy: -20,
                            style: { fontWeight: 'bold' }
                        }} 
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    
                    {/* RENDERIZADO DINÁMICO DE LÍNEAS */}
                    {Object.keys(METRIC_DETAILS).map(key => {
                        const detail = METRIC_DETAILS[key];
                        
                        const isMainMetric = key === selectedMetric;
                        const isSecondaryMetric = key === 'totalWorkouts';
                        
                        // Solo renderizamos la métrica principal y la de entrenamientos.
                        if (!isMainMetric && !isSecondaryMetric) {
                            return null;
                        }

                        return (
                            <Line 
                                key={key}
                                yAxisId={detail.yAxisId} 
                                type="monotone" 
                                dataKey={key} 
                                name={`${detail.name} ${detail.unit ? `(${detail.unit})` : ''}`}
                                stroke={detail.color} 
                                strokeWidth={isMainMetric ? 4 : 2}
                                dot={isMainMetric ? { r: 6 } : false}
                                activeDot={{ r: 8 }} 
                                opacity={isMainMetric ? 1 : 0.6}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProfileChart;