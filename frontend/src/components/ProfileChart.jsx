import React from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
// ⬇️ Importaciones de MUI
import { Box, Typography, useTheme } from '@mui/material';

// =========================================================================
// DEFINICIÓN DE MÉTRICAS (MANTENIDA)
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
// Función de Tooltip Personalizado (MIGRADA A MUI)
// =========================================================================
const CustomTooltip = ({ active, payload, label }) => {
    // Usamos useTheme dentro de la función si es un componente de función
    // Pero como es un componente renderizado por Recharts, no podemos usar hooks directamente aquí.
    // Usaremos Box y Typography para simular el estilo Dark/MUI.
    
    if (active && payload && payload.length) {
        return (
            <Box 
                sx={{ 
                    // Estilos reemplazando el `div` del tooltip
                    p: 1.5, 
                    backgroundColor: 'rgba(30, 40, 50, 0.95)', // Fondo oscuro
                    border: '1px solid',
                    borderColor: 'primary.dark', 
                    borderRadius: '8px', 
                    color: 'white',
                    fontSize: '14px',
                    boxShadow: 6
                }}
            >
                <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {label}
                </Typography>
                {payload.map((item, index) => {
                    const detail = METRIC_DETAILS[item.dataKey];
                    const unit = detail ? detail.unit : '';
                    
                    return (
                        <Typography 
                            key={index} 
                            component="p"
                            variant="body2"
                            sx={{ color: item.color, textTransform: 'capitalize' }}
                        >
                            {item.name}: **{item.value.toLocaleString('es-ES')}** {unit}
                        </Typography>
                    );
                })}
            </Box>
        );
    }
    return null;
};


/**
 * Componente de gráfico de línea para la progresión global mensual.
 */
const ProfileChart = ({ data, selectedMetric }) => {
    const theme = useTheme(); // Para acceder a los colores del tema de MUI
    const mainMetric = METRIC_DETAILS[selectedMetric];

    if (!mainMetric) return <Typography color="error">Métrica de gráfica no válida.</Typography>;

    return (
        // Reemplazamos el div por Box
        <Box sx={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    
                    {/* Reemplazamos el color fijo de la grilla por un color del tema */}
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    
                    {/* Eje X (Mes/Año) */}
                    <XAxis 
                        dataKey="month" 
                        stroke={theme.palette.text.primary} // Color de texto primario
                        angle={-15} 
                        textAnchor="end" 
                        height={50}
                        style={{ fontSize: '12px' }}
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
                            style: { fontWeight: 'bold', fontSize: '13px' } // Estilo del label
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
                            style: { fontWeight: 'bold', fontSize: '13px' } // Estilo del label
                        }} 
                    />
                    
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Ajustamos el estilo del contenedor de la leyenda con Box */}
                    <Legend wrapperStyle={{ paddingTop: '10px', color: theme.palette.text.secondary }} />
                    
                    {/* RENDERIZADO DINÁMICO DE LÍNEAS (Lógica mantenida) */}
                    {Object.keys(METRIC_DETAILS).map(key => {
                        const detail = METRIC_DETAILS[key];
                        
                        const isMainMetric = key === selectedMetric;
                        const isSecondaryMetric = key === 'totalWorkouts';
                        
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
        </Box>
    );
};

export default ProfileChart;