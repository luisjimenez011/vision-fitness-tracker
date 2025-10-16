import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Los colores son importantes para diferenciar las líneas.
const colors = ['#007AFF', '#FF9500', '#5856D6', '#34C759', '#FF2D55', '#AF52DE', '#5AC8FA'];

// Componente modificado para ser dinámico
const ProgressChart = ({ data, exerciseNames, yAxisLabel }) => {
    // Si no hay datos (la data ya viene transformada de DashboardPage), muestra un mensaje
    if (!data || data.length === 0 || !exerciseNames || exerciseNames.length === 0) {
        return (
            <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
                    No hay suficientes datos de entrenamiento registrados para el rango seleccionado.
                </p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{
                    top: 15, // Aumentado para mejor visualización
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                {/* Usamos LineChart, pero si fuera necesario se podría cambiar a BarChart aquí */}
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="monthYear" angle={-30} textAnchor="end" height={50} /> 
                <YAxis 
                    label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#333' }} 
                    tickFormatter={(value) => (yAxisLabel.includes('Volumen') ? value.toLocaleString() : value.toFixed(1))}
                />
                <Tooltip 
                    formatter={(value, name, props) => [
                        yAxisLabel.includes('Volumen') ? value.toLocaleString() + ' kg' : value.toFixed(1) + ' kg', 
                        name
                    ]}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {/* Iteramos sobre los nombres únicos de los ejercicios para crear una línea para cada uno */}
                {exerciseNames.map((name, index) => (
                    <Line
                        key={name}
                        type="monotone"
                        dataKey={name} // DataKey es el nombre del ejercicio (clave en la data transformada)
                        stroke={colors[index % colors.length]}
                        activeDot={{ r: 8 }}
                        strokeWidth={3}
                        dot={false} // Quitamos los puntos por defecto
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ProgressChart;