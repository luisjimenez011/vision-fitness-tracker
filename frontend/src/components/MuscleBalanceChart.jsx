import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// ⬇️ Importaciones de MUI
import { Box, Typography, Alert, Paper, useTheme } from '@mui/material';

// Función de color que usabas (manteniendo el gradiente)
const getBarColor = (volume, maxVolume) => {
    if (volume === 0 || !volume) return '#e0e0e0';
    // Se asegura que normalizedVolume no sea NaN si maxVolume es 0 o indefinido (aunque ya está cubierto)
    const normalizedVolume = maxVolume > 0 ? Math.min(1, volume / maxVolume) : 0; 
    
    // Gradiente de azul claro (menos volumen) a azul oscuro (más volumen)
    const R = Math.round(150 - normalizedVolume * 50);
    const G = Math.round(200 - normalizedVolume * 50);
    const B = Math.round(255 - normalizedVolume * 30);
    return `rgb(${R},${G},${B})`; 
};

// Componente Customizado para la barra que aplica el color pre-calculado
const CustomBar = (props) => {
    const { x, y, width, height, fillColor } = props;
    return <rect x={x} y={y} width={width} height={height} fill={fillColor} rx={10} ry={10} />;
};

/**
 * Gráfico de barras horizontales para el balance muscular, usando MUI para el layout.
 * @param {Object} props.data - Objeto {GrupoMuscular: volumen}
 */
const MuscleBalanceChart = ({ data, title }) => {
    // Usar el tema de MUI para acceder a colores o fuentes
    const theme = useTheme();

    // Extraer el volumen de "Otros" para tratarlo por separado
    const otherVolume = data['Otros'] || 0;
    
    // 1. Convertir los datos a array, excluyendo 'Otros' y ceros
    const filteredData = Object.keys(data)
        .filter(key => key !== 'Otros' && data[key] > 0);

    // 2. Calcular el volumen máximo (solo de los grupos principales)
    const maxVolume = Math.max(1, ...filteredData.map(key => data[key]));

    // 3. Crear chartData con colores pre-calculados
    const chartData = filteredData
        .map(key => ({
            name: key,
            volumen: data[key],
            // 🌟 SOLUCIÓN: Calcular y asignar el color a cada elemento
            fillColor: getBarColor(data[key], maxVolume) 
        }))
        .sort((a, b) => b.volumen - a.volumen); // Ordenar por volumen descendente

    // Si no hay datos relevantes para mostrar la gráfica...
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
    
    // 4. Altura dinámica
    const chartHeight = Math.max(300, chartData.length * 40 + 60); 
    
    // Título opcional, si no se proporciona, no se muestra
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
                    
                    {/* Eje Y: Nombres de grupos musculares */}
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={theme.palette.text.secondary} 
                        tickLine={false} 
                        axisLine={false}
                        width={80} 
                        style={{ fontSize: '12px' }}
                    />
                    
                    {/* Eje X: Valores de volumen (Kg) */}
                    <XAxis 
                        type="number" 
                        stroke={theme.palette.text.secondary} 
                        domain={[0, 'auto']} 
                        tickFormatter={(value) => `${value.toLocaleString()} kg`}
                        style={{ fontSize: '12px' }}
                    />
                    
                    {/* Tooltip: Muestra el valor al pasar el ratón */}
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: theme.palette.background.paper, 
                            border: `1px solid ${theme.palette.primary.main}` 
                        }}
                        formatter={(value) => [`${value.toLocaleString()} kg`, 'Volumen']} 
                        labelFormatter={(label) => label} 
                    />
                    
                    {/* Barras: Usamos CustomBar para obtener el color dinámico por barra */}
                    <Bar 
                        dataKey="volumen" 
                        name="Volumen (kg)" 
                        shape={<CustomBar />} // 🌟 Usamos el componente CustomBar
                        barSize={30} 
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Mostrar el volumen 'Otros' debajo del gráfico */}
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