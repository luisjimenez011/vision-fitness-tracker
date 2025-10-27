import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography, Alert, useTheme } from '@mui/material';

// Función para calcular un color degradado basado en el volumen (de claro a oscuro)
const getBarColor = (volume, maxVolume) => {
    if (volume === 0 || !volume) return '#e0e0e0';
    const normalizedVolume = maxVolume > 0 ? Math.min(1, volume / maxVolume) : 0; 
    
    // Gradiente de azul claro (menos volumen) a azul oscuro (más volumen)
    const R = Math.round(150 - normalizedVolume * 50);
    const G = Math.round(200 - normalizedVolume * 50);
    const B = Math.round(255 - normalizedVolume * 30);
    return `rgb(${R},${G},${B})`; 
};

// Componente personalizado de barra para aplicar el color pre-calculado
const CustomBar = (props) => {
    const { x, y, width, height, fillColor } = props;
    return <rect x={x} y={y} width={width} height={height} fill={fillColor} rx={10} ry={10} />;
};

/**
 * Gráfico de barras horizontales que visualiza el volumen total levantado 
 * por cada grupo muscular principal.
 * @param {Object} props.data - Objeto {GrupoMuscular: volumen_total_kg}
 * @param {string} [props.title] - Título del gráfico.
 */
const MuscleBalanceChart = ({ data, title }) => {
    const theme = useTheme();

    // Excluir el volumen de 'Otros' y los grupos con volumen cero
    const otherVolume = data['Otros'] || 0;
    
    const filteredData = Object.keys(data)
        .filter(key => key !== 'Otros' && data[key] > 0);

    // Calcular el volumen máximo para la escala de color
    const maxVolume = Math.max(1, ...filteredData.map(key => data[key]));

    // Crear el array de datos para Recharts con el color ya asignado
    const chartData = filteredData
        .map(key => ({
            name: key,
            volumen: data[key],
            fillColor: getBarColor(data[key], maxVolume) 
        }))
        .sort((a, b) => b.volumen - a.volumen); // Ordenar barras de mayor a menor volumen

    // Mostrar alerta si no hay datos de volumen relevantes
    if (chartData.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 2, textAlign: 'center' }}>
                <Typography variant="body1">
                    No hay volumen de entrenamiento registrado para los grupos musculares principales.
                </Typography>
                {otherVolume > 0 && 
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                        Volumen en 'Otros' (Ejercicios no clasificados): {otherVolume.toLocaleString()} kg
                    </Typography>
                }
            </Alert>
        );
    }
    
    // Altura dinámica basada en el número de barras
    const chartHeight = Math.max(300, chartData.length * 40 + 60); 
    const chartTitle = title || "Volumen por Grupo Muscular";

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" component="h3" align="center" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
                {chartTitle}
            </Typography>
            
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart 
                    data={chartData} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    
                    {/* Eje Y: Muestra los nombres de los grupos musculares */}
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={theme.palette.text.secondary} 
                        tickLine={false} 
                        axisLine={false}
                        width={80} 
                        style={{ fontSize: '12px' }}
                    />
                    
                    {/* Eje X: Muestra la escala de volumen en kg */}
                    <XAxis 
                        type="number" 
                        stroke={theme.palette.text.secondary} 
                        domain={[0, 'auto']} 
                        tickFormatter={(value) => `${value.toLocaleString()} kg`}
                        style={{ fontSize: '12px' }}
                    />
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: theme.palette.background.paper, 
                            border: `1px solid ${theme.palette.primary.main}` 
                        }}
                        formatter={(value) => [`${value.toLocaleString()} kg`, 'Volumen']} 
                        labelFormatter={(label) => label} 
                    />
                    
                    {/* Barras: Usa el componente CustomBar para aplicar el color dinámico */}
                    <Bar 
                        dataKey="volumen" 
                        name="Volumen (kg)" 
                        shape={<CustomBar />} 
                        barSize={30} 
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Etiqueta para el volumen clasificado como 'Otros' */}
            {otherVolume > 0 && (
                <Box sx={{ textAlign: 'right', mt: 1, pr: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                        Volumen no clasificado ('Otros'): 
                        <Typography component="strong" sx={{ color: 'error.main', ml: 0.5, fontWeight: 'bold' }}>
                            {otherVolume.toLocaleString()} kg
                        </Typography>
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default MuscleBalanceChart;