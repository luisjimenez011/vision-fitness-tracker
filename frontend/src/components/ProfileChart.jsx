import React from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

// =========================================================================
// DEFINICIÓN DE MÉTRICAS
// =========================================================================
const METRIC_DETAILS = {
    // Métricas principales (seleccionables por el usuario)
    'totalVolume': { name: 'Volumen Total', unit: 'kg', color: '#007AFF', yAxisId: 'main' },
    'totalDuration': { name: 'Duración Total', unit: 'min', color: '#FF9500', yAxisId: 'main' },
    'totalReps': { name: 'Total Repeticiones', unit: 'reps', color: '#34C759', yAxisId: 'main' },
    // Métrica secundaria (siempre visible en el eje secundario)
    'totalWorkouts': { name: 'Entrenamientos Completados', unit: 'entrenos', color: '#999999', yAxisId: 'secondary' }, 
};


/**
 * Componente de gráfico de línea para la progresión global mensual.
 * Muestra una métrica principal seleccionada y la métrica fija de entrenamientos.
 * @param {object[]} props.data - Datos de progresión mensual.
 * @param {string} props.selectedMetric - Clave de la métrica principal a mostrar.
 */
const ProfileChart = ({ data, selectedMetric }) => {
    const theme = useTheme(); 
    const mainMetric = METRIC_DETAILS[selectedMetric];

    // =========================================================================
    // Componente Tooltip Personalizado
    // =========================================================================
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box 
                    sx={{ 
                        // Estilo del Tooltip adaptable al tema (claro/oscuro)
                        p: 1.5, 
                        backgroundColor: theme.palette.background.paper, 
                        border: '1px solid',
                        borderColor: theme.palette.primary.main, 
                        borderRadius: '8px', 
                        color: theme.palette.text.primary, 
                        fontSize: '14px',
                        boxShadow: 6
                    }}
                >
                    <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {label}
                    </Typography>
                    {payload.map((item, index) => {
                        const detail = METRIC_DETAILS[item.dataKey];
                        const value = typeof item.value === 'number' ? item.value : 0;
                        const unit = detail ? detail.unit : '';
                        
                        return (
                            <Typography 
                                key={index} 
                                component="p"
                                variant="body2"
                                sx={{ color: item.color, textTransform: 'capitalize' }}
                            >
                                {item.name}: **{value.toLocaleString('es-ES')}** {unit}
                            </Typography>
                        );
                    })}
                </Box>
            );
        }
        return null;
    };
    // =========================================================================
    // Fin del Tooltip
    // =========================================================================


    if (!mainMetric) return <Typography color="error">Métrica de gráfica no válida.</Typography>;

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    
                    {/* Grilla: Color adaptable al tema */}
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    
                    {/* Eje X (Etiquetas de Mes/Año) */}
                    <XAxis 
                        dataKey="month" 
                        stroke={theme.palette.text.primary} 
                        angle={-15} 
                        textAnchor="end" 
                        height={50}
                        style={{ fontSize: '12px' }}
                    />
                    
                    {/* Eje Y PRINCIPAL: Asignado a la métrica seleccionada */}
                    <YAxis 
                        yAxisId="main" 
                        stroke={mainMetric.color}
                        label={{ 
                            value: `${mainMetric.name} (${mainMetric.unit})`,
                            angle: -90, 
                            position: 'insideLeft', 
                            fill: mainMetric.color, 
                            dy: 20,
                            style: { fontWeight: 'bold', fontSize: '13px' } 
                        }} 
                    />
                    
                    {/* Eje Y SECUNDARIO: Asignado a la métrica de 'totalWorkouts' */}
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
                            style: { fontWeight: 'bold', fontSize: '13px' } 
                        }} 
                    />
                    
                    {/* Tooltip: Utiliza el componente personalizado para estilos de MUI */}
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Leyenda: Estilo adaptable al tema */}
                    <Legend wrapperStyle={{ paddingTop: '10px', color: theme.palette.text.secondary }} />
                    
                    {/* RENDERIZADO DINÁMICO DE LÍNEAS */}
                    {Object.keys(METRIC_DETAILS).map(key => {
                        const detail = METRIC_DETAILS[key];
                        const isMainMetric = key === selectedMetric;
                        const isSecondaryMetric = key === 'totalWorkouts';
                        
                        // Solo renderiza la métrica seleccionada y la métrica secundaria fija
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
                                // Diferencia la línea principal de la secundaria con grosor y puntos
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