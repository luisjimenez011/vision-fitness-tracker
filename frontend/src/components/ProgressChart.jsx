import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// ⬇️ Importaciones de MUI
import { Box, Typography, useTheme } from '@mui/material';

// Los colores son importantes para diferenciar las líneas.
const colors = ['#007AFF', '#FF9500', '#5856D6', '#34C759', '#FF2D55', '#AF52DE', '#5AC8FA'];

// =========================================================================
// Función de Tooltip Personalizado para MUI (MEJORADA)
// =========================================================================
// Añadimos 'chartMetric' a las props para un formato preciso
const CustomTooltip = ({ active, payload, label, chartMetric, theme }) => {
    if (active && payload && payload.length) {
        
        // Función para determinar la unidad y el formato
        const formatValue = (value, metric) => {
            const numValue = typeof value === 'number' ? value : 0;

            if (metric.includes('volume')) {
                // Volumen: Formateo con separador de miles y 'kg'
                return `${numValue.toLocaleString('es-ES')} kg`;
            } else if (metric.includes('duration')) {
                // Duración: Formateo con un decimal y 'min'
                return `${numValue.toFixed(1)} min`;
            } else if (metric.includes('reps')) {
                // Repeticiones: Formateo entero y 'reps'
                return `${Math.round(numValue).toLocaleString('es-ES')} reps`;
            }
            return numValue.toLocaleString(); // Por defecto, solo número
        };

        return (
            <Box 
                sx={{ 
                    p: 1.5, 
                    // Adaptación al tema claro/oscuro
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 40, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid',
                    borderColor: theme.palette.primary.main, 
                    borderRadius: '8px', 
                    color: theme.palette.text.primary,
                    boxShadow: 6
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.text.primary }}>
                    {label}
                </Typography>
                {payload.map((item, index) => {
                    const formattedValue = formatValue(item.value, chartMetric);
                        
                    return (
                        <Typography 
                            key={index} 
                            variant="body2"
                            sx={{ color: item.color }}
                        >
                            {item.dataKey}: **{formattedValue}**
                        </Typography>
                    );
                })}
            </Box>
        );
    }
    return null;
};


/**
 * Componente de gráfico de línea para la progresión de ejercicios.
 */
const ProgressChart = ({ data, exerciseNames, yAxisLabel, chartMetric }) => {
    const theme = useTheme();

    // Si no hay datos (la data ya viene transformada de DashboardPage), muestra un mensaje
    if (!data || data.length === 0 || !exerciseNames || exerciseNames.length === 0) {
        return (
            <Box 
                sx={{ 
                    minHeight: '400px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <Typography variant="body1" align="center" sx={{ color: 'text.secondary' }}>
                    No hay suficientes datos de entrenamiento registrados para el rango y la métrica seleccionada.
                </Typography>
            </Box>
        );
    }
    
    // Función de formato de Tooltip (ahora solo envuelve el componente CustomTooltip)
    const renderCustomTooltip = (props) => (
        // 🌟 PASAMOS chartMetric COMO PROP AL TOOLTIP
        <CustomTooltip {...props} chartMetric={chartMetric} theme={theme} />
    );

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{
                    top: 15, 
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                
                {/* Eje X (Mes/Año) */}
                <XAxis 
                    dataKey="monthYear" 
                    stroke={theme.palette.text.secondary} 
                    angle={-30} 
                    textAnchor="end" 
                    height={50}
                    style={{ fontSize: '12px' }}
                /> 
                
                {/* Eje Y (Métrica Dinámica) */}
                <YAxis 
                    stroke={theme.palette.text.primary} 
                    label={{ 
                        value: yAxisLabel, 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: theme.palette.text.primary,
                        style: { fontWeight: 'bold', fontSize: '13px' }
                    }} 
                    tickFormatter={(value) => {
                        // Formato del eje Y (igual que en el Tooltip pero sin unidad)
                        if (chartMetric.includes('volume')) {
                            return value.toLocaleString();
                        } else if (chartMetric.includes('duration')) {
                            return value.toFixed(1);
                        } else if (chartMetric.includes('reps')) {
                            return Math.round(value).toLocaleString();
                        }
                        return value.toLocaleString();
                    }}
                    style={{ fontSize: '12px' }}
                />
                
                {/* Tooltip: Usamos el componente personalizado para estilos MUI */}
                <Tooltip content={renderCustomTooltip} />
                
                {/* Leyenda */}
                <Legend wrapperStyle={{ paddingTop: '10px', color: theme.palette.text.secondary }} />
                
                {/* Iteramos sobre los nombres únicos de los ejercicios para crear una línea para cada uno */}
                {exerciseNames.slice(0, 7).map((name, index) => ( // Limitamos a 7 líneas para no exceder los colores
                    <Line
                        key={name}
                        type="monotone"
                        dataKey={name} 
                        stroke={colors[index % colors.length]}
                        activeDot={{ r: 8, strokeWidth: 3, stroke: colors[index % colors.length], fill: theme.palette.background.paper }}
                        strokeWidth={3}
                        dot={false} 
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ProgressChart;