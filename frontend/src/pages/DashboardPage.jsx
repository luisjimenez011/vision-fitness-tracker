import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import ProgressChart from '../components/ProgressChart.jsx'; 
import TrainingCalendar from '../components/TrainingCalendar.jsx'; 
import { Link } from 'react-router-dom';

// ⬇️ IMPORTACIONES DE MUI
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


// ** Función para transformar los datos (Lógica Mantenida)**
const transformChartData = (data, metric) => {
    const transformedData = {};
    const exercises = new Set();
    
    data.forEach(item => {
        const { monthYear, exerciseName } = item;
        const value = item[metric]; 
        
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
    
    // Estados existentes
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true); 
    const [errorLogs, setErrorLogs] = useState(''); 
    const [aiAnalysisText, setAiAnalysisText] = useState("Cargando análisis de rendimiento de IA...");
    const [rawVolumeData, setRawVolumeData] = useState([]); 
    const [loadingAnalysis, setLoadingAnalysis] = useState(true);
    const [timeRange, setTimeRange] = useState('180'); 
    const [chartMetric, setChartMetric] = useState('totalVolume'); 

    // Mapeo de filtros (Lógica Mantenida)
    const timeRangeMap = {
        '90': 90, 
        '180': 180, 
        '365': 365, 
        'all': 3650 
    };

    // Effects (Lógica Mantenida)
    useEffect(() => {
        // ... fetchLogs logic ...
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

    useEffect(() => {
        // ... fetchAnalysis logic ...
        const fetchAnalysis = async () => {
            try {
                setLoadingAnalysis(true);
                const days = timeRangeMap[timeRange];
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
    }, [timeRange]); 

    // Cálculos y Títulos (Lógica Mantenida)
    const { chartData, exerciseNames, chartTitle, yAxisLabel } = useMemo(() => {
        const { chartData, exerciseNames } = transformChartData(rawVolumeData, chartMetric);
        
        let title = '';
        let yLabel = '';

        if (chartMetric === 'totalVolume') {
            title = 'Progresión de Volumen Total';
            yLabel = 'Volumen Total (kg)';
        } else {
            title = 'Progresión de Peso Promedio';
            yLabel = 'Peso Promedio (kg)';
        }
        
        return { chartData, exerciseNames, chartTitle: title, yAxisLabel: yLabel };
    }, [rawVolumeData, chartMetric]);


    // Lógica de Renderizado con MUI
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            
            <Typography variant="h3" component="h1" color="primary" align="center" sx={{ mb: 4, fontWeight: 700 }}>
                Dashboard de Progresión
            </Typography>

            {/* INTEGRACIÓN DEL CALENDARIO */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h2">
                        Mi Consistencia
                    </Typography>
                </Box>
                {/* Asumiendo que TrainingCalendar ya es responsive o se ajusta bien */}
                <TrainingCalendar logs={logs} loading={loadingLogs} />
            </Card>

            {/* PANEL DE ANÁLISIS DE IA */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h2">
                        Análisis de Rendimiento IA
                    </Typography>
                </Box>
                
                {loadingAnalysis ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <CircularProgress size={20} color="primary" sx={{ mr: 1 }} />
                        <Typography>{aiAnalysisText}</Typography>
                    </Box>
                ) : (
                    <Box 
                        sx={{ 
                            textAlign: 'left', 
                            whiteSpace: 'pre-wrap', // 🌟 SOLUCIÓN: Mantiene saltos de línea y formato del texto de la IA
                            lineHeight: '1.6',
                            p: 2,
                            borderRadius: '8px',
                            bgcolor: 'background.default', // Usamos el color de fondo para el bloque de texto
                            boxShadow: 1
                        }}
                    >
                        {/* 🌟 Solución: Renderizamos el texto de la IA directamente en un Box con pre-wrap */}
                        <Typography component="pre" sx={{ 
                            fontFamily: 'Roboto, sans-serif', // Asegura una fuente legible
                            whiteSpace: 'pre-wrap', 
                            margin: 0, 
                            color: 'text.primary' // Asegura que el texto sea visible en el fondo
                        }}>
                            {aiAnalysisText}
                        </Typography>
                    </Box>
                )}
            </Card>
            
            {/* GRÁFICO DE PROGRESO DINÁMICO */}
            <Card sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <InsightsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h2">
                        {chartTitle}
                    </Typography>
                </Box>
                
                {/* Controles de Filtro */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 3, 
                    mb: 3, 
                    flexDirection: { xs: 'column', sm: 'row' } // Responsive: apila en móvil
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
                
                {/* Renderizado del Gráfico */}
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

            {/* HISTORIAL DE ENTRENAMIENTOS */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FitnessCenterIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" component="h2">
                        Historial de Entrenamientos
                    </Typography>
                </Box>
                
                {loadingLogs && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress color="primary" size={20} sx={{ mr: 1 }} />
                        <Typography>Cargando historial...</Typography>
                    </Box>
                )}
                
                {errorLogs && <Alert severity="error">{errorLogs}</Alert>}
                
                {!loadingLogs && !errorLogs && (
                    logs.length === 0 ? (
                        <Typography variant="body1" align="center" sx={{ color: 'text.secondary', mt: 2 }}>
                            No tienes entrenamientos registrados. ¡Empieza una rutina!
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            {logs.map(log => {
                                const minutes = Math.floor(log.duration_seconds / 60);
                                const seconds = log.duration_seconds % 60;
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