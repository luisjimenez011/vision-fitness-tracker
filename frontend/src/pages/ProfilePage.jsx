import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient.js";
import MuscleBalanceChart from "../components/MuscleBalanceChart.jsx";
import ProfileChart from "../components/ProfileChart.jsx";

// ⬇️ IMPORTACIONES DE MUI
import { 
    Box, 
    Typography, 
    Container, 
    CircularProgress, 
    Alert, 
    Card, 
    Grid, 
    List, 
    ListItem, 
    ListItemText,
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel,
    Divider 
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';


// Opciones para el selector de período de la gráfica (Mantenido)
const TIME_FILTERS = [
    { label: "Últimos 30 días", days: 30 },
    { label: "Últimos 3 meses", days: 90 },
    { label: "Últimos 6 meses", days: 180 },
    { label: "Último Año", days: 365 },
];

// Opciones de métricas para el selector de la gráfica (Mantenido)
const METRIC_FILTERS = [
    { key: "totalVolume", label: "Volumen (kg)", color: "#AA00FF" }, 
    { key: "totalDuration", label: "Duración (min)", color: "#FF9500" },
    { key: "totalReps", label: "Repeticiones", color: "#34C759" },
];

// ----------------------------------------------
// Componente de Tarjeta de Estadística Reutilizable (MOVIDO AQUÍ)
// ----------------------------------------------
const StatCard = ({ title, value, icon }) => (
    <Card 
        sx={{ 
            p: 3, 
            textAlign: 'center', 
            height: '100%', 
            // Borde izquierdo en morado para destacar
            borderLeft: '5px solid', 
            borderColor: 'primary.main' 
        }}
    >
        <Box sx={{ color: 'primary.main', mb: 1.5 }}>
            {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
        </Typography>
    </Card>
);

function ProfilePage() {
    const [stats, setStats] = useState(null);
    const [muscleVolume, setMuscleVolume] = useState({});
    const [aiAnalysis, setAiAnalysis] = useState(
        "Analizando el equilibrio muscular..."
    );

    const [globalProgressData, setGlobalProgressData] = useState([]);

    // Filtros
    const [daysBack, setDaysBack] = useState(TIME_FILTERS[2].days);
    const [selectedMetric, setSelectedMetric] = useState(METRIC_FILTERS[0].key);

    const [loading, setLoading] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(false);
    const [error, setError] = useState("");

    // Efecto 1: Carga de estadísticas y balance muscular
    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsResponse = await apiClient.get("/profile/stats");
                setStats(statsResponse.data);

                const muscleResponse = await apiClient.get(
                    // Se usa 30 días para el análisis muscular inicial, es correcto
                    "/profile/muscle-map?daysBack=30" 
                );
                setMuscleVolume(muscleResponse.data.muscleVolume || {});
                setAiAnalysis(
                    muscleResponse.data.aiAnalysis || "Análisis no disponible."
                );
            } catch (err) {
                console.error("Error al cargar el perfil:", err);
                if (!stats)
                    setError("Error al cargar los datos principales del perfil.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Efecto 2: Carga de datos para el gráfico global (depende de daysBack)
    useEffect(() => {
        if (loading) return;

        const fetchChartData = async () => {
            setLoadingCharts(true);
            try {
                const chartResponse = await apiClient.get(
                    `/profile/charts?daysBack=${daysBack}`
                );
                
                const mappedData = (chartResponse.data.progression || []).map(
                    (item) => ({
                        month: item.monthYear,
                        // Convierte segundos a minutos
                        totalDuration: Math.round((item.totalDurationSeconds || 0) / 60), 
                        totalVolume: item.totalVolume || 0,
                        totalReps: item.totalReps || 0,
                        totalWorkouts: item.totalWorkouts || 0,
                    })
                );

                setGlobalProgressData(mappedData);
            } catch (err) {
                console.error("Error al cargar la gráfica global:", err);
                setGlobalProgressData([]);
            } finally {
                setLoadingCharts(false);
            }
        };

        fetchChartData();
    }, [daysBack, loading]);

    if (loading)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Cargando perfil...</Typography>
            </Box>
        );

    if (error)
        return (
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );

    // Lógica para mostrar los ejercicios más frecuentes (Mantenida intacta)
    const topExercises = stats.mostFrequentExercises
        ? Object.entries(stats.mostFrequentExercises)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 5)
        : [];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" component="h1" color="primary" sx={{ mb: 4, fontWeight: 700 }}>
                Perfil de {stats.username}
            </Typography>

            {/* A. ESTADÍSTICAS CLAVE */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
                {/* Total de Entrenos */}
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Total de Entrenos" 
                        value={stats.totalWorkouts.toLocaleString()} 
                        icon={<FitnessCenterIcon />}
                    />
                </Grid>
                {/* Miembro Desde */}
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard 
                        title="Miembro desde" 
                        value={new Date(stats.memberSince).toLocaleDateString()} 
                        icon={<AccessTimeIcon />}
                    />
                </Grid>
               
            </Grid>
            
            <Grid container spacing={4} sx={{ mb: 5 }}>
                {/* B. EJERCICIOS MÁS FRECUENTES (TOP 5) */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h5" component="h2" sx={{ mb: 2, color: 'primary.main' }}>
                            🔥 Top 5 Ejercicios
                        </Typography>
                        <List disablePadding>
                            {topExercises.map(([name, count], index) => (
                                <ListItem key={name} sx={{ borderBottom: 1, borderColor: 'divider', py: 1 }}>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                {index + 1}. {name}
                                            </Typography>
                                        } 
                                        secondary={`Realizado ${count} veces`} 
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>

                {/* C. BALANCE MUSCULAR (Gráfico y Análisis de IA) */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h5" component="h2" sx={{ color: 'primary.main' }}>
                                Equilibrio Muscular
                            </Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                            {/* Gráfico de Balance */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
                                    <Typography variant="subtitle1" align="center" sx={{ mb: 1, color: 'text.secondary' }}>
                                        Volumen por Grupo Muscular (30 días)
                                    </Typography>
                                    <MuscleBalanceChart
                                        data={muscleVolume}
                                    />
                                </Box>
                            </Grid>
                            
                            {/* Análisis IA */}
                            <Grid item xs={12} md={6}>
                                <Box 
                                    sx={{ 
                                        bgcolor: 'background.default', 
                                        p: 2, 
                                        borderRadius: 2, 
                                        minHeight: { xs: 200, md: 340 }, 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                    }}
                                >
                                    <Typography variant="h6" color="primary.light" sx={{ mb: 1 }}>
                                        Análisis IA:
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                                        {aiAnalysis}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>


            {/* D. GRÁFICOS GLOBALES */}
            <Card sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: 'wrap' }}>
                    <Typography variant="h5" component="h2" sx={{ color: 'primary.main', mb: { xs: 2, sm: 0 } }}>
                        📊 Progresión Global Mensual
                    </Typography>
                    
                    <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap' }}>
                        {/* Selector de MÉTRICA */}
                        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                            <InputLabel id="metric-select-label" color="primary">Métrica</InputLabel>
                            <Select 
                                labelId="metric-select-label"
                                value={selectedMetric} 
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                label="Métrica"
                                color="primary"
                            >
                                {METRIC_FILTERS.map((metric) => (
                                    <MenuItem key={metric.key} value={metric.key}>
                                        {metric.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        {/* Selector de TIEMPO */}
                        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                            <InputLabel id="time-select-label" color="primary">Rango de Tiempo</InputLabel>
                            <Select 
                                labelId="time-select-label"
                                value={daysBack} 
                                onChange={(e) => setDaysBack(parseInt(e.target.value, 10))}
                                label="Rango de Tiempo"
                                color="primary"
                            >
                                {TIME_FILTERS.map((filter) => (
                                    <MenuItem key={filter.days} value={filter.days}>
                                        {filter.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {loadingCharts ? (
                    <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress color="primary" />
                        <Typography sx={{ ml: 2 }}>Cargando datos de la gráfica...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ height: 400, mt: 2 }}>
                        {globalProgressData.length > 0 ? (
                            <ProfileChart
                                data={globalProgressData}
                                selectedMetric={selectedMetric}
                            />
                        ) : (
                            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                                <Typography>No hay datos de entrenamiento para el periodo seleccionado.</Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Card>
        </Container>
    );
}

export default ProfilePage;