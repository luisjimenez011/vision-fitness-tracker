import React, { useState, useEffect, useMemo } from "react";
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
    Divider,
    Paper, // Usaremos Paper para algunas secciones
} from "@mui/material";
// Importamos Skeleton para la optimización y UX de carga
import Skeleton from "@mui/material/Skeleton"; 
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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
// Componente de Tarjeta de Estadística Reutilizable (Optimizada con React.memo)
// ----------------------------------------------
const StatCard = React.memo(({ title, value, icon }) => (
    <Paper 
        elevation={3}
        sx={{ 
            p: 3, 
            textAlign: 'center', 
            height: '100%', 
            // Nuevo estilo: Borde superior más grueso para un toque moderno
            borderTop: '5px solid', 
            borderColor: 'primary.main',
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
            }
        }}
    >
        <Box sx={{ color: 'primary.main', mb: 1.5, fontSize: 32 }}>
            {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
        </Typography>
    </Paper>
));

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

    // Efecto 1: Carga de estadísticas y balance muscular (Mantenida intacta)
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

    // Efecto 2: Carga de datos para el gráfico global (depende de daysBack) (Mantenida intacta)
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

    // Lógica para el cálculo de ejercicios más frecuentes (Optimizada con useMemo)
    const topExercises = useMemo(() => {
        return stats?.mostFrequentExercises
            ? Object.entries(stats.mostFrequentExercises)
                .sort(([, countA], [, countB]) => countB - countA)
                .slice(0, 5)
            : [];
    }, [stats]);


    /* ------------------------------------- */
    /* ESTADOS DE CARGA / ERROR     */
    /* ------------------------------------- */
    // Nuevo manejo de carga para mostrar Skeletons
    if (loading)
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ mb: 4 }}>
                    <Skeleton width="40%" />
                </Typography>
                
                {/* Skeletons para las tarjetas de estadísticas */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    {/* Ajustado a 2 tarjetas grandes */}
                    {[...Array(2)].map((_, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>

                {/* Skeletons para el layout de gráficos */}
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 2 }} />
                    </Grid>
                </Grid>
            </Container>
        );

    if (error)
        return (
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    /* ------------------------------------- */

    // Obtener la métrica actual para la gráfica
    const currentMetric = METRIC_FILTERS.find(m => m.key === selectedMetric);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" component="h1" color="primary" sx={{ mb: 4, fontWeight: 700 }}>
                 Perfil de {stats?.username || 'Usuario'}
            </Typography>

            {/* A. SECCIÓN PRINCIPAL DE ESTADÍSTICAS (Total Entrenos y Miembro Desde) */}
            <Paper  elevation={4} sx={{ p: 3, mb: 5, borderRadius: 3 }} >
                {/* ESTOS YA OCUPAN LA MITAD EN SM Y MD. xs={12} sm={6} md={6} */}
                
                    {/* Total de Entrenos: xs=12, sm=6, md=6 (Mitad en PC y móvil ancho) */}
                    <Grid item xs={12} sm={6} md={6}> 
                        <StatCard 
                            title="Total de Entrenos" 
                            value={stats.totalWorkouts.toLocaleString()} 
                            icon={<FitnessCenterIcon fontSize="inherit" />}
                        />
                    </Grid>
                    
                    {/* Miembro Desde: xs=12, sm=6, md=6 (Mitad en PC y móvil ancho) */}
                    <Grid item xs={12} sm={6} md={6} mt={6}>
                        <StatCard 
                            title="Miembro desde" 
                            value={new Date(stats.memberSince).toLocaleDateString()} 
                            icon={<AccessTimeIcon fontSize="inherit" />}
                        />
                    </Grid>
                
            </Paper>
            
            {/* GRÁFICOS Y ANÁLISIS (Secciones D, C y B) */}
            <Grid>
                
                {/* D. GRÁFICO DE PROGRESIÓN GLOBAL (OCUPA TODO EL ANCHO) */}
                {/* xs=12, md=12 (Ancho completo) */}
                <Grid item xs={12} md={12}>
                    <Card sx={{ p: 3, mb: 4, height: 'auto' }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: 'wrap' }}>
                            <Typography variant="h5" component="h2" sx={{ color: 'primary.main', mb: { xs: 2, sm: 0 }, display: 'flex', alignItems: 'center' }}>
                                <TrendingUpIcon sx={{ mr: 1 }} /> Progresión Mensual de {currentMetric?.label || 'Volumen'}
                            </Typography>
                            
                            <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap' }}>
                                {/* Selectores de Filtros (Métrica y Tiempo) */}
                                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
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
                                
                                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel id="time-select-label" color="primary">Rango</InputLabel>
                                    <Select 
                                        labelId="time-select-label"
                                        value={daysBack} 
                                        onChange={(e) => setDaysBack(parseInt(e.target.value, 10))}
                                        label="Rango"
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
                            </Box>
                        ) : (
                            <Box sx={{ height: 400, mt: 2 }}>
                                {globalProgressData.length > 0 ? (
                                    <ProfileChart
                                        data={globalProgressData}
                                        selectedMetric={selectedMetric}
                                        metricColor={currentMetric?.color || METRIC_FILTERS[0].color}
                                    />
                                ) : (
                                    <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                                        <Typography>No hay datos de entrenamiento para el periodo seleccionado.</Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Card>
                </Grid>

                {/* C. BALANCE MUSCULAR (Gráfico y Análisis de IA) + B. TOP 5 EJERCICIOS */}
                {/* Este Grid item debe seguir ocupando todo el ancho (xs=12) para que los elementos internos puedan dividirse en la siguiente línea */}
                <Grid item xs={12} > 
                    <Card sx={{ p: 3, height: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h5" component="h2" sx={{ color: 'primary.main' }}>
                                Análisis Muscular & Hábitos
                            </Typography>
                        </Box>
                        
                        {/* CONTENEDOR INTERNO PARA EL GRÁFICO Y EL TOP 5 */}
                        <Grid container spacing={6}>
                            
                            {/* Gráfico de Balance (C): xs=12 (Completo en móvil), md=6 (Mitad en PC) */}
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                    <Typography variant="subtitle1" align="center" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                                        Volumen por Grupo Muscular (30 días)
                                    </Typography>
                                    <MuscleBalanceChart
                                        data={muscleVolume}
                                    />
                                </Paper>
                            </Grid>
                            
                            {/* Top 5 Ejercicios (B): xs=12 (Completo en móvil), md=6 (Mitad en PC) */}
                            <Grid item xs={12} md={6} >
                                <Card elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                    <Typography variant="h6" component="h3" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                                        🔥 Top 5 Ejercicios Frecuentes
                                    </Typography>
                                    <List disablePadding>
                                        {topExercises.length > 0 ? (
                                            topExercises.map(([name, count], index) => (
                                                <React.Fragment key={name}>
                                                    <ListItem sx={{ py: 1 }}>
                                                        <ListItemText 
                                                            primary={
                                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                                    {index + 1}. {name}
                                                                </Typography>
                                                            } 
                                                            secondary={`Realizado ${count} veces`} 
                                                        />
                                                    </ListItem>
                                                    {index < topExercises.length - 1 && <Divider component="li" />}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <ListItemText secondary="No hay ejercicios frecuentes registrados." sx={{ ml: 2 }} />
                                        )}
                                    </List>
                                </Card>
                            </Grid>
                            
                            {/* Análisis IA (Ocupa todo el ancho en una nueva fila, como lo solicitaste) */}
                            <Grid item xs={12}>
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 3, 
                                        borderRadius: 2, 
                                        border: '1px solid', 
                                        borderColor: 'divider',
                                        bgcolor: 'rgba(25, 118, 210, 0.05)', // Pequeño color de fondo para destacarlo
                                    }}
                                >
                                    <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                                        🤖 Consejos del Entrenador IA:
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                                        {aiAnalysis}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
                
            </Grid>
        </Container>
    );
}

export default ProfilePage;