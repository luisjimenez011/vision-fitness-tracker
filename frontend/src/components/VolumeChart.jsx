import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

// Componente modificado para recibir data y exerciseNames como props
const VolumeChart = ({ data, exerciseNames }) => {
    // Si no hay datos (la data ya viene transformada de DashboardPage), muestra un mensaje
    if (!data || data.length === 0 || !exerciseNames || exerciseNames.length === 0) {
        return <p style={{ textAlign: 'center', marginTop: '20px' }}>No hay suficientes datos de volumen para mostrar la progresión.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                {/* DataKey debe coincidir con la clave que usaremos para agrupar los meses: 'monthYear' */}
                <XAxis dataKey="monthYear" /> 
                <YAxis label={{ value: 'Volumen Total (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {/* Iteramos sobre los nombres únicos de los ejercicios para crear una línea para cada uno */}
                {exerciseNames.map((name, index) => (
                    <Line
                        key={name}
                        type="monotone"
                        dataKey={name} // DataKey es el nombre del ejercicio (clave en la data transformada)
                        stroke={colors[index % colors.length]}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default VolumeChart;