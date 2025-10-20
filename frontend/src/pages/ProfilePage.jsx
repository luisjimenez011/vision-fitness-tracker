import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient.js';
// 🛑 Importa tus componentes (descomentar cuando los tengas creados)
import BodyMap from '../components/BodyMap.jsx'; 
import ProfileChart from '../components/ProfileChart.jsx'; 
// Asegúrate de que los archivos BodyMap.jsx y ProfileChart.jsx existen en /components

// Opciones para el selector de período de la gráfica
const TIME_FILTERS = [
    { label: 'Últimos 30 días', days: 30 },
    { label: 'Últimos 3 meses', days: 90 },
    { label: 'Últimos 6 meses', days: 180 },
    { label: 'Último Año', days: 365 },
];

function ProfilePage() {
    const [stats, setStats] = useState(null);
    // 🛑 ESTADOS AÑADIDOS
    const [muscleVolume, setMuscleVolume] = useState({}); 
    const [aiAnalysis, setAiAnalysis] = useState('Analizando el equilibrio muscular...');
    
    const [globalProgressData, setGlobalProgressData] = useState([]); 
    const [daysBack, setDaysBack] = useState(TIME_FILTERS[2].days); 
    const [loading, setLoading] = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(false); 
    const [error, setError] = useState('');

    // Efecto 1: Carga inicial de datos clave y mapa corporal (estos son fijos o tienen un filtro predeterminado)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Obtener Estadísticas Clave y Ejercicios Frecuentes
                const statsResponse = await apiClient.get('/profile/stats');
                setStats(statsResponse.data);

                // 2. Obtener Mapa Corporal y Análisis de IA (Usando un filtro de 30 días por defecto)
                const muscleResponse = await apiClient.get('/profile/muscle-map?daysBack=30'); 
                setMuscleVolume(muscleResponse.data.muscleVolume || {});
                setAiAnalysis(muscleResponse.data.aiAnalysis || 'Análisis no disponible.');

            } catch (err) {
                console.error("Error al cargar el perfil:", err);
                // Si falla solo el mapa, no bloqueamos la página, pero mostramos un error:
                if (!stats) setError("Error al cargar los datos principales del perfil."); 
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Efecto 2: Carga de la Gráfica Global al cambiar el filtro de tiempo
    useEffect(() => {
        if (loading) return; // Esperar a la carga inicial

        const fetchChartData = async () => {
            setLoadingCharts(true);
            try {
                // Endpoint: /api/profile/charts?daysBack=X
                const chartResponse = await apiClient.get(`/profile/charts?daysBack=${daysBack}`);
                // La data debe ser un array para el gráfico
                setGlobalProgressData(chartResponse.data.progression || []);
            } catch (err) {
                console.error("Error al cargar la gráfica global:", err);
                // Muestra un error específico en la sección del gráfico si falla
                setGlobalProgressData([]); 
            } finally {
                setLoadingCharts(false);
            }
        };

        fetchChartData();
    }, [daysBack, loading]); // Recargar cuando cambie el filtro o la carga inicial termine

    if (loading) return <div className="profile-container">Cargando perfil...</div>;
    if (error) return <div className="profile-container error" style={{ color: 'red', padding: '20px' }}>{error}</div>;

    // Lógica para mostrar los ejercicios más frecuentes (Top 5)
    const topExercises = stats.mostFrequentExercises 
        ? Object.entries(stats.mostFrequentExercises)
              .sort(([, countA], [, countB]) => countB - countA)
              .slice(0, 5)
        : [];

    return (
        <div className="profile-container" style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <h1 style={{ color: '#007AFF' }}>Perfil de {stats.username}</h1>
            
            {/* A. ESTADÍSTICAS CLAVE */}
            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0', backgroundColor: '#000000ff', padding: '15px', borderRadius: '10px' }}>
                <div>🏋️ Total de Entrenos: <strong>{stats.totalWorkouts.toLocaleString()}</strong></div>
                <div>🗓️ Miembro desde: <strong>{new Date(stats.memberSince).toLocaleDateString()}</strong></div>
            </div>

            {/* B. EJERCICIOS MÁS FRECUENTES */}
            <div style={{ marginBottom: '40px', border: '1px solid #d4d4d4ff', padding: '20px', borderRadius: '10px', backgroundColor: '#000000ff' }}>
                <h2>🔥 Top 5 Ejercicios</h2>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {topExercises.map(([name, count], index) => (
                        <li key={name} style={{ margin: '8px 0', borderBottom: '1px dotted #000000ff', paddingBottom: '5px' }}>
                            {index + 1}. **{name}** (Realizado {count} veces)
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* C. MAPA CORPORAL Y ANÁLISIS DE IA (Ahora usando el componente BodyMap) */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', alignItems: 'center' }}>
                <div style={{ flex: 1, border: '1px solid #ddd', padding: '20px', borderRadius: '10px', backgroundColor: '#000000ff' }}>
                    <h3>🧬 Equilibrio Muscular del Mes</h3>
                    {/* 🛑 COMPONENTE BODY MAP AQUÍ */}
                    <BodyMap data={muscleVolume} title="Volumen por Grupo Muscular (30 días)" />
                </div>
                <div style={{ flex: 1, backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '20px', borderRadius: '10px', minHeight: '300px' }}>
                    <h3>🧠 Análisis IA de Balance</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{aiAnalysis}</p>
                </div>
            </div>


            {/* D. GRÁFICOS GLOBALES (Ahora usando el componente ProfileChart) */}
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', backgroundColor: '#000000ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>📊 Progresión Global Mensual</h2>
                    <select
                        value={daysBack}
                        onChange={(e) => setDaysBack(parseInt(e.target.value, 10))}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        {TIME_FILTERS.map(filter => (
                            <option key={filter.days} value={filter.days}>
                                {filter.label}
                            </option>
                        ))}
                    </select>
                </div>
                
                {loadingCharts ? (
                    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Cargando datos de la gráfica...
                    </div>
                ) : (
                    <div style={{ height: '400px', marginTop: '20px' }}>
                        {globalProgressData.length > 0 ? (
                            // 🛑 COMPONENTE PROFILE CHART AQUÍ
                            <ProfileChart data={globalProgressData} />
                        ) : (
                            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                No hay datos de entrenamiento para el periodo seleccionado.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;