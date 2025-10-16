import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
// Cambiamos el nombre para poder usarlo para varios gráficos
import ProgressChart from '../components/ProgressChart.jsx'; 
import TrainingCalendar from '../components/TrainingCalendar.jsx'; 


// Función para transformar los datos del backend al formato de Recharts
// Ahora acepta un parámetro 'metric' para saber qué valor tomar (totalVolume o averageWeight)
const transformChartData = (data, metric) => {
    const transformedData = {};
    const exercises = new Set();
    
    data.forEach(item => {
        const { monthYear, exerciseName } = item;
        const value = item[metric]; // Usamos la métrica elegida
        
        if (!transformedData[monthYear]) {
            transformedData[monthYear] = { monthYear }; 
        }
        
        transformedData[monthYear][exerciseName] = value; 
        exercises.add(exerciseName);
    });
    
    return { 
        chartData: Object.values(transformedData).sort((a, b) => a.monthYear.localeCompare(b.monthYear)),
        exerciseNames: Array.from(exercises)
    };
};


function DashboardPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    
    // Estados existentes para historial
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true); 
    const [errorLogs, setErrorLogs] = useState(''); 

    // Estados para el análisis de volumen
    const [aiAnalysisText, setAiAnalysisText] = useState("Cargando análisis de rendimiento de IA...");
    
    // 🛑 Almacenamos los datos crudos de la API
    const [rawVolumeData, setRawVolumeData] = useState([]); 
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);
    
    // 🛑 NUEVOS ESTADOS para el control del gráfico
    const [timeRange, setTimeRange] = useState('180'); // 180 días por defecto
    const [chartMetric, setChartMetric] = useState('totalVolume'); // 'totalVolume' o 'averageWeight'

    // Mapeo de filtros para daysBack
    const timeRangeMap = {
        '90': 90,  // 3 Meses
        '180': 180, // 6 Meses
        '365': 365, // 1 Año
        'all': 3650 // 10 Años (todo el historial)
    };

    // 🛑 Effect para fetch del historial (el calendario usa este endpoint internamente)
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoadingLogs(true);
                const response = await apiClient.get('/workout/logs');
                setLogs(response.data);
            } catch (err) {
                console.error('Error al cargar los logs de entrenamiento:', err);
                setErrorLogs('Error al cargar el historial. Asegúrate de estar conectado.');
            } finally {
                setLoadingLogs(false);
            }
        };

        fetchLogs();
    }, []);

    // 🛑 Effect para fetch de datos de progreso y análisis de IA
    // Ahora depende de timeRange para solicitar datos específicos.
    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setLoadingAnalysis(true);
                
                // 🛑 Construye la URL con daysBack
                const days = timeRangeMap[timeRange];
                const url = `/workout/progress/volume?daysBack=${days}`;
                
                const response = await apiClient.get(url);
                const { volumeData, aiAnalysis } = response.data; 

                setAiAnalysisText(aiAnalysis); 
                setRawVolumeData(volumeData); // Guarda los datos crudos

            } catch (err) {
                console.error('Error al cargar el análisis de volumen:', err);
                setAiAnalysisText('Error al cargar el análisis de la IA. Inténtalo de nuevo más tarde.');
                setRawVolumeData([]);
            } finally {
                setLoadingAnalysis(false);
            }
        };

        fetchAnalysis();
    }, [timeRange]); // 🛑 Se ejecuta cada vez que el rango de tiempo cambia

    // 🛑 Cálculos basados en los datos crudos y la métrica seleccionada (useMemo)
    const { chartData, exerciseNames, chartTitle, yAxisLabel } = useMemo(() => {
        const { chartData, exerciseNames } = transformChartData(rawVolumeData, chartMetric);
        
        let title = '';
        let yLabel = '';

        if (chartMetric === 'totalVolume') {
            title = '📈 Progresión de Volumen Total';
            yLabel = 'Volumen Total (kg)';
        } else {
            title = '🏋️ Progresión de Peso Promedio';
            yLabel = 'Peso Promedio (kg)';
        }
        
        return { chartData, exerciseNames, chartTitle: title, yAxisLabel: yLabel };
    }, [rawVolumeData, chartMetric]);

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };


    return (
        <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            fontFamily: 'Inter, sans-serif',
            maxWidth: '1000px',
            margin: '0 auto'
        }}>
            <h1 style={{ color: '#007AFF', marginBottom: '20px' }}>Dashboard de Progresión</h1>

            {/* INTEGRACIÓN DEL CALENDARIO */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#000000ff' }}>
                <h2 style={{ fontSize: '1.5em' }}>📅 Mi Consistencia</h2>
                <TrainingCalendar />
            </div>

            {/* PANEL DE ANÁLISIS DE IA */}
            <div style={{ 
                marginBottom: '40px', 
                backgroundColor: '#2c3e50', // Fondo oscuro
                color: '#ecf0f1', // Texto claro
                padding: '20px', 
                borderRadius: '10px' 
            }}>
                <h2>🧠 Análisis de Rendimiento IA</h2>
                {loadingAnalysis ? (
                    <p>{aiAnalysisText}</p>
                ) : (
                    <div style={{ 
                        textAlign: 'left', 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: '1.6',
                        backgroundColor: '#34495e',
                        padding: '15px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                    }}>
                        {aiAnalysisText}
                    </div>
                )}
            </div>
            
            {/* GRÁFICO DE PROGRESO DINÁMICO */}
            <div style={{ marginBottom: '40px', backgroundColor: '#030303ff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h2>{chartTitle}</h2>
                
                {/* Controles de Filtro */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                    {/* Selector de Métrica (Volumen vs Peso Promedio) */}
                    <select 
                        value={chartMetric} 
                        onChange={(e) => setChartMetric(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="totalVolume">Volumen Total</option>
                        <option value="averageWeight">Peso Promedio</option>
                    </select>
                    
                    {/* Selector de Rango de Tiempo (Días) */}
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="90">Últimos 3 Meses</option>
                        <option value="180">Últimos 6 Meses</option>
                        <option value="365">Último Año</option>
                        <option value="all">Todo el Historial</option>
                    </select>
                </div>
                
                {/* Renderizado del Gráfico */}
                {loadingAnalysis ? (
                    <p>Cargando gráfico...</p>
                ) : (
                    <ProgressChart 
                        data={chartData} 
                        exerciseNames={exerciseNames} 
                        yAxisLabel={yAxisLabel} // Pasamos la etiqueta dinámica
                        chartMetric={chartMetric} // Pasamos la métrica
                    /> 
                )}
            </div>
            
            {/* HISTORIAL DE ENTRENAMIENTOS (Sin cambios significativos, solo estilo) */}
            <h2>Historial de Entrenamientos</h2>
            {loadingLogs && <p>Cargando historial...</p>}
            {errorLogs && <p style={{ color: 'red' }}>{errorLogs}</p>}
            
            {!loadingLogs && !errorLogs && (
                logs.length === 0 ? (
                    <p>No tienes entrenamientos registrados. ¡Empieza una rutina!</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {logs.map(log => {
                            const minutes = Math.floor(log.duration_seconds / 60);
                            const seconds = log.duration_seconds % 60;

                            return (
                                <div key={log.id} style={logItemStyle}>
                                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                        {log.day_name || `Rutina #${log.routine_id}`}
                                    </h3>
                                    <p><strong>Duración:</strong> {minutes} min {seconds} seg</p>
                                    <p><strong>Fecha:</strong> {new Date(log.created_at).toLocaleString()}</p>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

          
        </div>
    );
}

export default DashboardPage;


// Estilos para los selectores y botones
const selectStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #1be400ff',
    outline: 'none',
    cursor: 'pointer',
    backgroundColor: '#000000ff',
    minWidth: '150px'
};



const logItemStyle = {
    border: '1px solid #ccc', 
    borderRadius: '8px', 
    padding: '15px', 
    margin: '10px 0', 
    width: '100%', 
    maxWidth: '600px',
    textAlign: 'left',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    backgroundColor: '#000000ff'
};