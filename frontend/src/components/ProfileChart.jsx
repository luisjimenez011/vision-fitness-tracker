import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// --- Función de Tooltip Personalizado ---
// Mejora la presentación de los datos al pasar el ratón
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: 'rgba(44, 62, 80, 0.95)', // Gris oscuro
        border: '1px solid #34495e', 
        borderRadius: '5px', 
        color: 'white',
        fontSize: '14px'
      }}>
        <p className="font-bold text-base mb-1">{label}</p>
        {payload.map((item, index) => (
          <p key={index} style={{ color: item.color }} className="capitalize">
            {item.name}: {item.value.toLocaleString('es-ES')} 
            {item.dataKey === 'totalVolume' ? ' kg' : ''}
            {item.dataKey === 'totalDuration' ? ' mins' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


/**
 * Componente de gráfico de línea para la progresión global mensual.
 * @param {Object} props
 * @param {Array<Object>} props.data - Datos de progresión del backend 
 * (Ej: [{ month: 'Ene 24', totalVolume: 45000, totalWorkouts: 12, totalDuration: 600, ... }])
 */
const ProfileChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
          {/* Eje X (Mes/Año) */}
          <XAxis 
            dataKey="month" // Asumiendo que el campo se llama 'month' (Ej: 'Ene 24')
            stroke="#333" 
            angle={-15} 
            textAnchor="end" 
            height={50}
          />
          
          {/* Eje Y Izquierdo (Volumen) */}
          <YAxis 
            yAxisId="volume" 
            stroke="#2ecc71" // Verde (Volumen)
            label={{ 
              value: 'Volumen (kg)', 
              angle: -90, 
              position: 'insideLeft', 
              fill: '#2ecc71', 
              dy: 20,
              style: { fontWeight: 'bold' }
            }} 
          />
          
          {/* Eje Y Derecho (Duración/Workouts) */}
          <YAxis 
            yAxisId="secondary" 
            orientation="right" 
            stroke="#f39c12" // Naranja (Secundario)
            label={{ 
              value: 'Mins / Entrenos', 
              angle: 90, 
              position: 'insideRight', 
              fill: '#f39c12', 
              dy: -20,
              style: { fontWeight: 'bold' }
            }} 
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          
          {/* Línea 1: Volumen Total (Eje Y Izquierdo) */}
          <Line 
            yAxisId="volume" 
            type="monotone" 
            dataKey="totalVolume" 
            name="Volumen Total" 
            stroke="#2ecc77" 
            strokeWidth={3}
            activeDot={{ r: 8 }} 
          />
          
          {/* Línea 2: Duración Total (Eje Y Derecho) */}
          <Line 
            yAxisId="secondary" 
            type="monotone" 
            dataKey="totalDuration" 
            name="Duración Total (Mins)" 
            stroke="#3498db" // Azul
            strokeWidth={2}
            dot={false}
          />
          
          {/* Línea 3: Entrenamientos Completados (Eje Y Derecho) */}
          <Line 
            yAxisId="secondary" 
            type="monotone" 
            dataKey="totalWorkouts" 
            name="Entrenamientos" 
            stroke="#f39c12" // Naranja
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfileChart;