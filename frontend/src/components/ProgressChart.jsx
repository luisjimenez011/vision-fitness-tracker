import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// ⬇️ Importaciones de MUI
import { Box, Typography, useTheme } from '@mui/material';

// Los colores son importantes para diferenciar las líneas.
// Mantenemos los colores definidos, pero podrías mapearlos a la paleta de MUI si fuera necesario
const colors = ['#007AFF', '#FF9500', '#5856D6', '#34C759', '#FF2D55', '#AF52DE', '#5AC8FA'];

// =========================================================================
// Función de Tooltip Personalizado para MUI
// =========================================================================
const CustomTooltip = ({ active, payload, label, yAxisLabel, theme }) => {
    if (active && payload && payload.length) {
        return (
            <Box 
                sx={{ 
                    p: 1.5, 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 40, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid',
                    borderColor: theme.palette.primary.main, 
                    borderRadius: '8px', 
                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                    boxShadow: 6
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5, color: theme.palette.text.primary }}>
                    {label}
                </Typography>
                {payload.map((item, index) => {
                    // Formateo similar al del Eje Y
                    const formattedValue = yAxisLabel.includes('Volumen') 
                        ? item.value.toLocaleString() + ' kg' 
                        : item.value.toFixed(1) + ' kg';
                        
                    return (
                        <Typography 
                            key={index} 
                            variant="body2"
                            sx={{ color: item.color }}
                        >
                            {item.name}: **{formattedValue}**
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
        <CustomTooltip {...props} yAxisLabel={yAxisLabel} theme={theme} />
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
                    stroke={theme.palette.text.secondary} // Color de texto
                    angle={-30} 
                    textAnchor="end" 
                    height={50}
                    style={{ fontSize: '12px' }}
                /> 
                
                {/* Eje Y (Métrica Dinámica) */}
                <YAxis 
                    stroke={theme.palette.text.primary} // Color de texto
                    label={{ 
                        value: yAxisLabel, 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: theme.palette.text.primary,
                        style: { fontWeight: 'bold', fontSize: '13px' }
                    }} 
                    tickFormatter={(value) => (
                        // Mantenemos la lógica de formato
                        yAxisLabel.includes('Volumen') ? value.toLocaleString() : value.toFixed(1)
                    )}
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