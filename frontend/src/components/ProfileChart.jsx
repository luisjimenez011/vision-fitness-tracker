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


/**
 * Componente de gráfico de línea para la progresión global mensual.
 */
const ProfileChart = ({ data, selectedMetric }) => {
    const theme = useTheme(); // Para acceder a los colores del tema de MUI
    const mainMetric = METRIC_DETAILS[selectedMetric];

    // =========================================================================
    // Función de Tooltip Personalizado (MOVIDA Y MEJORADA PARA USAR EL TEMA)
    // =========================================================================
    // Definimos el componente Tooltip dentro de ProfileChart para acceder a `theme`.
    // Aunque no podemos usar el hook `useTheme` directamente dentro de un componente 
    // renderizado por Recharts, podemos pasar el objeto `theme` como prop o usar 
    // los valores directamente en el estilo. Aquí mejoramos el estilo para usar 
    // colores del tema (fondo/texto) en lugar de valores fijos oscuros.
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box 
                    sx={{ 
                        // Colores adaptables al tema (claro/oscuro)
                        p: 1.5, 
                        backgroundColor: theme.palette.background.paper, 
                        border: '1px solid',
                        borderColor: theme.palette.primary.main, 
                        borderRadius: '8px', 
                        color: theme.palette.text.primary, // Texto primario del tema
                        fontSize: '14px',
                        boxShadow: 6
                    }}
                >
                    <Typography variant="subtitle1" component="p" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {label}
                    </Typography>
                    {payload.map((item, index) => {
                        const detail = METRIC_DETAILS[item.dataKey];
                        // Aseguramos que el valor sea un número para el toLocaleString
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
    // FIN DEL TOOLTIP
    // =========================================================================


    if (!mainMetric) return <Typography color="error">Métrica de gráfica no válida.</Typography>;

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    
                    {/* Grilla: Color adaptable al tema */}
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    
                    {/* Eje X (Mes/Año) */}
                    <XAxis 
                        dataKey="month" 
                        stroke={theme.palette.text.primary} 
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
                            style: { fontWeight: 'bold', fontSize: '13px' } 
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
                            style: { fontWeight: 'bold', fontSize: '13px' } 
                        }} 
                    />
                    
                    {/* Tooltip: Usa el componente CustomTooltip definido arriba */}
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Leyenda: Estilo adaptable al tema */}
                    <Legend wrapperStyle={{ paddingTop: '10px', color: theme.palette.text.secondary }} />
                    
                    {/* RENDERIZADO DINÁMICO DE LÍNEAS */}
                    {Object.keys(METRIC_DETAILS).map(key => {
                        const detail = METRIC_DETAILS[key];
                        
                        const isMainMetric = key === selectedMetric;
                        const isSecondaryMetric = key === 'totalWorkouts';
                        
                        // Solo renderizamos la métrica seleccionada y la de entrenamientos
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