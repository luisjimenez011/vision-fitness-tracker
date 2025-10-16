import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import VolumeChart from '../components/VolumeChart.jsx'; 
// 🛑 Importar el nuevo componente de calendario
import TrainingCalendar from '../components/TrainingCalendar.jsx'; 


// Función para transformar los datos del backend al formato de Recharts
const transformVolumeData = (data) => {
    const transformedData = {};
    const exercises = new Set();
    
    data.forEach(item => {
        const { monthYear, exerciseName, totalVolume } = item;
        
        if (!transformedData[monthYear]) {
            transformedData[monthYear] = { monthYear }; 
        }
        
        transformedData[monthYear][exerciseName] = totalVolume; 
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
    const [chartData, setChartData] = useState([]);
    const [exerciseNames, setExerciseNames] = useState([]);
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);


    // Effect para fetch del historial (el calendario usa este endpoint internamente)
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

    // Effect para fetch de datos de progreso y análisis de IA
    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setLoadingAnalysis(true);
                const response = await apiClient.get('/workout/progress/volume');
                const { volumeData, aiAnalysis } = response.data; 

                setAiAnalysisText(aiAnalysis); 
                
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

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };


    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Dashboard</h1>

            {/* 🛑 INTEGRACIÓN DEL CALENDARIO */}
            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
                <TrainingCalendar />
            </div>

            {/* PANEL DE ANÁLISIS DE IA */}
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
            
            {/* GRÁFICO DE VOLUMEN */}
            <div style={{ marginBottom: '40px' }}>
                <h2>📈 Progresión de Volumen (Últimos 6 Meses)</h2>
                {loadingAnalysis ? (
                    <p>Cargando gráfico...</p>
                ) : (
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