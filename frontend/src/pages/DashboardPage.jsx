import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import ProgressChart from '../components/ProgressChart.jsx'; 
import TrainingCalendar from '../components/TrainingCalendar.jsx'; 
import { Link } from 'react-router-dom';


import { 
    Box, 
    Typography, 
    Container, 
    CircularProgress, 
    Alert, 
    Card, 
    Select, 
    MenuItem,
    FormControl,
    InputLabel,
    Divider
} from '@mui/material';

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';


// Función auxiliar para transformar los datos brutos de la API en el formato requerido por la gráfica.
// Agrupa los datos por mes/año y crea una clave para cada ejercicio.
const transformChartData = (data, metric) => {
    const transformedData = {};
    const exercises = new Set();
    
    data.forEach(item => {
        const { monthYear, exerciseName } = item;
        const value = item[metric]; 
        
        if (!transformedData[monthYear]) {
            transformedData[monthYear] = { monthYear }; 
        }
        
        // Asigna el valor (Volumen o Peso Promedio) al ejercicio para ese mes
        transformedData[monthYear][exerciseName] = value; 
        exercises.add(exerciseName);
    });
    
    // Devuelve los datos de la gráfica ordenados por fecha y la lista de nombres de ejercicios
    return { 
        chartData: Object.values(transformedData).sort((a, b) => a.monthYear.localeCompare(b.monthYear)),
        exerciseNames: Array.from(exercises)
    };
};


function DashboardPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    
    // Estado para almacenar el historial de logs de entrenamiento
    const [logs, setLogs] = useState([]);
    // Estado de carga para el historial de logs y el calendario
    const [loadingLogs, setLoadingLogs] = useState(true); 
    // Estado de error para la carga de logs
    const [errorLogs, setErrorLogs] = useState(''); 
    // Estado para el texto de análisis generado por la IA
    const [aiAnalysisText, setAiAnalysisText] = useState("Cargando análisis de rendimiento de IA...");
    // Estado para los datos de volumen brutos usados en la gráfica
    const [rawVolumeData, setRawVolumeData] = useState([]); 
    // Estado de carga para el análisis de la IA y el gráfico de progresión
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);
    // Estado para el rango de tiempo seleccionado para el análisis (días)
    const [timeRange, setTimeRange] = useState('180'); // Por defecto: 6 meses
    // Estado para la métrica seleccionada en la gráfica (totalVolume o averageWeight)
    const [chartMetric, setChartMetric] = useState('totalVolume'); 

    // Mapeo de valores de filtro de tiempo a días
    const timeRangeMap = {
        '90': 90, 
        '180': 180, 
        '365': 365, 
        'all': 3650 // Uso de un número grande para simular 'todo el historial'
    };

    // Efecto para cargar el historial de logs de entrenamiento (usado por el calendario)
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

    // Efecto para cargar los datos de progresión y el análisis de la IA (depende del rango de tiempo)
    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setLoadingAnalysis(true);
                const days = timeRangeMap[timeRange];
                // Endpoint para obtener datos de progresión de volumen y análisis de IA
                const url = `/workout/progress/volume?daysBack=${days}`;
                
                const response = await apiClient.get(url);
                const { volumeData, aiAnalysis } = response.data; 

                setAiAnalysisText(aiAnalysis); 
                setRawVolumeData(volumeData); 

            } catch (err) {
                console.error('Error al cargar el análisis de volumen:', err);
                setAiAnalysisText('Error al cargar el análisis de la IA. Inténtalo de nuevo más tarde.');
                setRawVolumeData([]);
            } finally {
                setLoadingAnalysis(false);
            }
        };

        fetchAnalysis();
    }, [timeRange]); // Se re-ejecuta cada vez que el rango de tiempo cambia

    // useMemo para procesar los datos brutos de la gráfica y definir títulos
    // Se recalcula solo si cambian los datos brutos o la métrica seleccionada
    const { chartData, exerciseNames, chartTitle, yAxisLabel } = useMemo(() => {
        const { chartData, exerciseNames } = transformChartData(rawVolumeData, chartMetric);
        
        let title = '';
        let yLabel = '';

        // Define el título y la etiqueta del eje Y basado en la métrica seleccionada
        if (chartMetric === 'totalVolume') {
            title = 'Progresión de Volumen Total por Ejercicio';
            yLabel = 'Volumen Total (kg)';
        } else {
            title = 'Progresión de Peso Promedio por Ejercicio';
            yLabel = 'Peso Promedio (kg)';
        }
        
        return { chartData, exerciseNames, chartTitle: title, yAxisLabel: yLabel };
    }, [rawVolumeData, chartMetric]);


    // Renderizado del componente DashboardPage
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            
            <Typography variant="h3" component="h1" color="primary" align="center" sx={{ mb: 4, fontWeight: 700 }}>
                Dashboard de Progresión
            </Typography>

            {/* SECCIÓN DEL CALENDARIO DE ENTRENAMIENTO */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h2">
                        Mi Consistencia
                    </Typography>
                </Box>
                {/* Componente que muestra los días de entrenamiento */}
                <TrainingCalendar logs={logs} loading={loadingLogs} />
            </Card>

            {/* SECCIÓN DE ANÁLISIS DE RENDIMIENTO DE LA IA */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h2">
                        Análisis de Rendimiento IA
                    </Typography>
                </Box>
                
                {/* Muestra el estado de carga o el texto del análisis */}
                {loadingAnalysis ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <CircularProgress size={20} color="primary" sx={{ mr: 1 }} />
                        <Typography>{aiAnalysisText}</Typography>
                    </Box>
                ) : (
                    <Box 
                        sx={{ 
                            textAlign: 'left', 
                            whiteSpace: 'pre-wrap', // Mantiene los saltos de línea y el formato del texto de la IA
                            lineHeight: '1.6',
                            p: 2,
                            borderRadius: '8px',
                            bgcolor: 'background.default',
                            boxShadow: 1
                        }}
                    >
                        {/* Se usa el componente 'pre' de Typography para mantener el formato del texto de la IA */}
                        <Typography component="pre" sx={{ 
                            fontFamily: 'Roboto, sans-serif', 
                            whiteSpace: 'pre-wrap', 
                            margin: 0, 
                            color: 'text.primary' 
                        }}>
                            {aiAnalysisText}
                        </Typography>
                    </Box>
                )}
            </Card>
            
            {/* SECCIÓN DEL GRÁFICO DE PROGRESO DINÁMICO */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <InsightsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h2">
                        {chartTitle}
                    </Typography>
                </Box>
                
                {/* Controles de Filtro para Métrica y Rango de Tiempo */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 3, 
                    mb: 3, 
                    flexDirection: { xs: 'column', sm: 'row' }
                }}>
                    
                    {/* Selector de Métrica */}
                    <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                        <InputLabel id="metric-select-label" color="primary">Métrica</InputLabel>
                        <Select 
                            labelId="metric-select-label"
                            value={chartMetric} 
                            onChange={(e) => setChartMetric(e.target.value)}
                            label="Métrica"
                            color="primary"
                        >
                            <MenuItem value="totalVolume">Volumen Total</MenuItem>
                            <MenuItem value="averageWeight">Peso Promedio</MenuItem>
                        </Select>
                    </FormControl>
                    
                    {/* Selector de Rango de Tiempo */}
                    <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                        <InputLabel id="range-select-label" color="primary">Rango</InputLabel>
                        <Select 
                            labelId="range-select-label"
                            value={timeRange} 
                            onChange={(e) => setTimeRange(e.target.value)}
                            label="Rango"
                            color="primary"
                        >
                            <MenuItem value="90">Últimos 3 Meses</MenuItem>
                            <MenuItem value="180">Últimos 6 Meses</MenuItem>
                            <MenuItem value="365">Último Año</MenuItem>
                            <MenuItem value="all">Todo el Historial</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                
                {/* Renderizado del Gráfico o indicador de carga */}
                {loadingAnalysis ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <ProgressChart 
                        data={chartData} 
                        exerciseNames={exerciseNames} 
                        yAxisLabel={yAxisLabel} 
                        chartMetric={chartMetric} 
                    /> 
                )}
            </Card>
            
            <Divider sx={{ my: 4 }} /> 

            {/* SECCIÓN DE HISTORIAL DE ENTRENAMIENTOS RECIENTES */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FitnessCenterIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h2">
                        Historial de Entrenamientos
                    </Typography>
                </Box>
                
                {/* Indicador de carga para los logs */}
                {loadingLogs && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress color="primary" size={20} sx={{ mr: 1 }} />
                        <Typography>Cargando historial...</Typography>
                    </Box>
                )}
                
                {/* Indicador de error */}
                {errorLogs && <Alert severity="error">{errorLogs}</Alert>}
                
                {/* Muestra la lista de logs o un mensaje si no hay */}
                {!loadingLogs && !errorLogs && (
                    logs.length === 0 ? (
                        <Typography variant="body1" align="center" sx={{ color: 'text.secondary', mt: 2 }}>
                            No tienes entrenamientos registrados. ¡Empieza una rutina!
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {logs.map(log => {
                                // Cálculo de minutos y segundos de la duración
                                const minutes = Math.floor(log.duration_seconds / 60);
                                const seconds = log.duration_seconds % 60;
                                
                                // Formateo de la fecha para mostrar
                                const formattedDate = new Date(log.created_at).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });

                                return (
                                    <Card 
                                        key={log.id} 
                                        sx={{ 
                                            width: '100%', 
                                            maxWidth: '600px', 
                                            p: 2, 
                                            textAlign: 'left',
                                            boxShadow: 2,
                                        }}
                                    >
                                        <Typography variant="h6" color="primary" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1 }}>
                                            {log.day_name || `Rutina #${log.routine_id}`}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Duración:</strong> {minutes} min {seconds} seg
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Fecha:</strong> {formattedDate}
                                        </Typography>
                                    </Card>
                                );
                            })}
                        </Box>
                    )
                )}
            </Box>
        </Container>
    );
}

export default DashboardPage;