import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// ⬇️ Importaciones de MUI
import { Box, Typography, Alert, Paper, useTheme } from '@mui/material';

// Función de color que usabas (manteniendo el gradiente)
const getBarColor = (volume, maxVolume) => {
    if (volume === 0 || !volume) return '#e0e0e0';
    const normalizedVolume = Math.min(1, volume / maxVolume); 
    
    // Gradiente de azul claro a azul oscuro
    const R = Math.round(150 - normalizedVolume * 50);
    const G = Math.round(200 - normalizedVolume * 50);
    const B = Math.round(255 - normalizedVolume * 30);
    return `rgb(${R},${G},${B})`; 
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
    const chartData = Object.keys(data)
        .filter(key => key !== 'Otros' && data[key] > 0)
        .map(key => ({
            name: key,
            volumen: data[key],
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
    
    // 2. Calcular el volumen máximo (solo de los grupos principales)
    const maxVolume = Math.max(1, ...chartData.map(item => item.volumen));
    
    // 3. Altura dinámica y color
    const chartHeight = Math.max(300, chartData.length * 40 + 60); 
    // Usamos el color de Recharts para todas las barras (se podría refactorizar para usar MUI primary.main)
    const primaryColor = getBarColor(maxVolume, maxVolume);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" component="h3" align="center" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
                {title}
            </Typography>
            
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart 
                    data={chartData} 
                    layout="vertical"
                    // Ajustamos los márgenes usando el Box de MUI o sx si fuera necesario, 
                    // pero aquí lo dejamos en Recharts para un control preciso del gráfico.
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    
                    {/* Eje Y: Nombres de grupos musculares */}
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={theme.palette.text.secondary} // Color de texto secundario
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
                    
                    {/* Barras */}
                    <Bar 
                        dataKey="volumen" 
                        name="Volumen (kg)" 
                        fill={primaryColor} // Usamos el color dinámico que calculaste
                        radius={[10, 10, 10, 10]}
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