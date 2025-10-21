// src/components/MuscleBalanceChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Función de color que usabas (ajustada para un gradiente visual)
const getBarColor = (volume, maxVolume) => {
    if (volume === 0 || !volume) return '#e0e0e0';
    const normalizedVolume = Math.min(1, volume / maxVolume); 
    
    const R = Math.round(150 - normalizedVolume * 50);
    const G = Math.round(200 - normalizedVolume * 50);
    const B = Math.round(255 - normalizedVolume * 30);
    return `rgb(${R},${G},${B})`; 
};

/**
 * Gráfico de barras horizontales para el balance muscular.
 * @param {Object} props.data - Objeto {GrupoMuscular: volumen}
 */
const MuscleBalanceChart = ({ data, title }) => {
    
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
            <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                <p>No hay volumen de entrenamiento registrado para los grupos musculares principales.</p>
                {otherVolume > 0 && 
                    <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                        Volumen en 'Otros' (Ejercicios no clasificados): {otherVolume.toLocaleString()} kg
                    </p>
                }
            </div>
        );
    }
    
    // 2. Calcular el volumen máximo (solo de los grupos principales)
    const maxVolume = Math.max(1, ...chartData.map(item => item.volumen));
    
    // 3. Altura dinámica y color
    // Damos 40px por barra + 60px para el padding y títulos
    const chartHeight = Math.max(300, chartData.length * 40 + 60); 
    const primaryColor = getBarColor(maxVolume, maxVolume);

    return (
        <div style={{ padding: '10px 0' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#333' }}>{title}</h3>
            
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart 
                    data={chartData} 
                    layout="vertical"
                    // Aumentamos el margen izquierdo para asegurar que las etiquetas largas quepan
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    
                    {/* Eje Y: Nombres de grupos musculares */}
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#666" 
                        tickLine={false} 
                        axisLine={false}
                        width={80} // Damos un ancho explícito al eje Y
                    />
                    
                    {/* Eje X: Valores de volumen (Kg) */}
                    <XAxis 
                        type="number" 
                        stroke="#666" 
                        domain={[0, 'auto']} 
                        tickFormatter={(value) => `${value.toLocaleString()} kg`}
                    />
                    
                    {/* Tooltip: Muestra el valor al pasar el ratón */}
                    <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()} kg`, 'Volumen']} 
                        labelFormatter={(label) => label} 
                    />
                    
                    {/* Barras */}
                    <Bar 
                        dataKey="volumen" 
                        name="Volumen (kg)" 
                        fill={primaryColor} 
                        radius={[10, 10, 10, 10]}
                        barSize={30} // Fijamos el tamaño de la barra para evitar compresión
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Mostrar el volumen 'Otros' debajo del gráfico */}
            {otherVolume > 0 && (
                <p style={{ textAlign: 'right', fontSize: '12px', color: '#888', marginTop: '10px' }}>
                    Volumen no clasificado ('Otros'): 
                    <strong style={{ color: '#FF0000', marginLeft: '5px' }}>{otherVolume.toLocaleString()} kg</strong>
                </p>
            )}
        </div>
    );
};

export default MuscleBalanceChart;