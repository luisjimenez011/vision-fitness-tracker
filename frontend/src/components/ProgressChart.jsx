import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

// Paleta de colores para diferenciar las líneas de los ejercicios
const colors = ['#007AFF', '#FF9500', '#5856D6', '#34C759', '#FF2D55', '#AF52DE', '#5AC8FA'];

// =========================================================================
// Componente Tooltip Personalizado
// =========================================================================
const CustomTooltip = ({ active, payload, label, chartMetric, theme }) => {
    if (active && payload && payload.length) {
        
        // Función para aplicar el formato y la unidad correcta al valor
        const formatValue = (value, metric) => {
            const numValue = typeof value === 'number' ? value : 0;

            if (metric.includes('volume')) {
                // Formateo con separador de miles y 'kg'
                return `${numValue.toLocaleString('es-ES')} kg`;
            } else if (metric.includes('duration')) {
                // Formateo con un decimal y 'min'
                return `${numValue.toFixed(1)} min`;
            } else if (metric.includes('reps')) {
                // Formateo entero y 'reps'
                return `${Math.round(numValue).toLocaleString('es-ES')} reps`;
            }
            return numValue.toLocaleString(); 
        };

        return (
            <Box 
                sx={{ 
                    p: 1.5, 
                    // Fondo semi-transparente adaptable al tema claro/oscuro
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
                    // Aplica el formato dinámico basado en la métrica del gráfico
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
 * Componente de gráfico de línea que compara la progresión de hasta 7 ejercicios a lo largo del tiempo.
 * @param {object[]} props.data - Datos de progresión transformados.
 * @param {string[]} props.exerciseNames - Nombres de los ejercicios a trazar.
 * @param {string} props.yAxisLabel - Etiqueta del eje Y (Volumen, Duración, etc.).
 * @param {string} props.chartMetric - Clave de la métrica ('totalVolume', 'avgDuration', etc.) para el formato.
 */
const ProgressChart = ({ data, exerciseNames, yAxisLabel, chartMetric }) => {
    const theme = useTheme();

    // Muestra un mensaje si no hay datos suficientes para dibujar el gráfico
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
    
    // Función que envuelve el Tooltip personalizado y le inyecta las props necesarias
    const renderCustomTooltip = (props) => (
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
                
                {/* Eje X: Muestra la progresión temporal (Mes/Año) */}
                <XAxis 
                    dataKey="monthYear" 
                    stroke={theme.palette.text.secondary} 
                    angle={-30} 
                    textAnchor="end" 
                    height={50}
                    style={{ fontSize: '12px' }}
                /> 
                
                {/* Eje Y: Muestra la escala de la métrica seleccionada */}
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
                        // Formato del eje Y (igual que en Tooltip pero sin la unidad)
                        if (chartMetric.includes('volume') || chartMetric.includes('reps')) {
                            return Math.round(value).toLocaleString();
                        } else if (chartMetric.includes('duration')) {
                            return value.toFixed(1);
                        }
                        return value.toLocaleString();
                    }}
                    style={{ fontSize: '12px' }}
                />
                
                {/* Tooltip: Usa el componente personalizado con estilos MUI */}
                <Tooltip content={renderCustomTooltip} />
                
                {/* Leyenda: Muestra los nombres de los ejercicios y sus colores */}
                <Legend wrapperStyle={{ paddingTop: '10px', color: theme.palette.text.secondary }} />
                
                {/* Dibuja una línea por cada ejercicio (limitado a 7 por los colores definidos) */}
                {exerciseNames.slice(0, 7).map((name, index) => (
                    <Line
                        key={name}
                        type="monotone"
                        dataKey={name} 
                        stroke={colors[index % colors.length]}
                        activeDot={{ r: 8, strokeWidth: 3, stroke: colors[index % colors.length], fill: theme.palette.background.paper }}
                        strokeWidth={3}
                        dot={false} // Oculta los puntos por defecto
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ProgressChart;