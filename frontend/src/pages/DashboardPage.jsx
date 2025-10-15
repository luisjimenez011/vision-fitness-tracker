import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import VolumeChart from '../components/VolumeChart.jsx'; // Asegúrate de que esta ruta es correcta

// Función para transformar los datos del backend al formato de Recharts (ahora en el Dashboard)
const transformVolumeData = (data) => {
    const transformedData = {};
    const exercises = new Set();
    
    data.forEach(item => {
        const { monthYear, exerciseName, totalVolume } = item;
        
        // 1. Inicializa la entrada del mes si no existe
        if (!transformedData[monthYear]) {
            transformedData[monthYear] = { monthYear }; 
        }
        
        // 2. Asigna el volumen al nombre del ejercicio para esa clave
        transformedData[monthYear][exerciseName] = totalVolume; 
        exercises.add(exerciseName);
    });
    
    // 3. Convierte el objeto a un array y ordena por mes/año
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
    const [loadingLogs, setLoadingLogs] = useState(true); // Renombrado para claridad
    const [errorLogs, setErrorLogs] = useState(''); // Renombrado para claridad

    // 🛑 NUEVOS ESTADOS PARA EL ANÁLISIS DE VOLUMEN
    const [aiAnalysisText, setAiAnalysisText] = useState("Cargando análisis de rendimiento de IA...");
    const [chartData, setChartData] = useState([]);
    const [exerciseNames, setExerciseNames] = useState([]);
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);


    // Effect para fetch del historial (puede mantenerse separado)
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

    // 🛑 NUEVO EFFECT PARA FETCH DE DATOS DE PROGRESO Y ANÁLISIS DE IA
    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setLoadingAnalysis(true);
                // 🛑 El endpoint ahora devuelve { volumeData, aiAnalysis }
                const response = await apiClient.get('/workout/progress/volume');
                const { volumeData, aiAnalysis } = response.data; 

                // 1. Manejar el análisis de IA (es solo un string)
                setAiAnalysisText(aiAnalysis); 
                
                // 2. Manejar los datos del gráfico
                if (volumeData && volumeData.length > 0) {
                    const { chartData: transformedChartData, exerciseNames: uniqueExercises } = transformVolumeData(volumeData);
                    setChartData(transformedChartData);
                    setExerciseNames(uniqueExercises);
                } else {
                    setChartData([]);
                    setExerciseNames([]);
                }

            } catch (err) {
                console.error('Error al cargar el análisis de volumen:', err);
                setAiAnalysisText('Error al cargar el análisis de la IA. Inténtalo de nuevo más tarde.');
            } finally {
                setLoadingAnalysis(false);
            }
        };

        fetchAnalysis();
    }, []); 

    // ... (Tu función handleLogout)
    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };


    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Dashboard</h1>
            <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Cerrar Sesión</button>

            {/* 🛑 PANEL DE ANÁLISIS DE IA */}
            <div style={{ 
                marginBottom: '40px', 
                backgroundColor: '#000000ff', 
                padding: '20px', 
                borderRadius: '10px' 
            }}>
                <h2>🧠 Análisis de Rendimiento IA</h2>
                {loadingAnalysis ? (
                    <p>{aiAnalysisText}</p>
                ) : (
                    <div style={{ 
                        textAlign: 'left', 
                        // Permite que la IA use saltos de línea y Markdown, si aplica
                        whiteSpace: 'pre-wrap', 
                        lineHeight: '1.6',
                        backgroundColor: '#000000ff',
                        padding: '15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        {aiAnalysisText}
                    </div>
                )}
            </div>
            
            {/* 🛑 GRÁFICO DE VOLUMEN */}
            <div style={{ marginBottom: '40px' }}>
                <h2>📈 Progresión de Volumen (Últimos 6 Meses)</h2>
                {loadingAnalysis ? (
                    <p>Cargando gráfico...</p>
                ) : (
                    // Pasamos los datos ya transformados al componente VolumeChart
                    <VolumeChart data={chartData} exerciseNames={exerciseNames} /> 
                )}
            </div>
            
            {/* HISTORIAL DE ENTRENAMIENTOS */}
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
                                <div key={log.id} style={{ 
                                    border: '1px solid #ccc', 
                                    borderRadius: '8px', 
                                    padding: '15px', 
                                    margin: '10px 0', 
                                    width: '80%', 
                                    maxWidth: '600px',
                                    textAlign: 'left'
                                }}>
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