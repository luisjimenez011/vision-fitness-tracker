import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient.js";
import MuscleBalanceChart from "../components/MuscleBalanceChart.jsx";
import ProfileChart from "../components/ProfileChart.jsx";

// Opciones para el selector de período de la gráfica
const TIME_FILTERS = [
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 3 meses", days: 90 },
  { label: "Últimos 6 meses", days: 180 },
  { label: "Último Año", days: 365 },
];

// Opciones de métricas para el selector de la gráfica
const METRIC_FILTERS = [
  { key: "totalVolume", label: "Volumen (kg)", color: "#007AFF" },
  { key: "totalDuration", label: "Duración (min)", color: "#FF9500" },
  { key: "totalReps", label: "Repeticiones", color: "#34C759" },
];

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

  // Efecto 1: Carga inicial de datos clave y mapa corporal
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener Estadísticas Clave y Ejercicios Frecuentes
        const statsResponse = await apiClient.get("/profile/stats");
        setStats(statsResponse.data);

        // 2. Obtener Volumen Muscular y Análisis de IA (fijo a 30 días)
        const muscleResponse = await apiClient.get(
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

  // Efecto 2: Carga de la Gráfica Global al cambiar el filtro de tiempo
  useEffect(() => {
    if (loading) return;

    const fetchChartData = async () => {
      setLoadingCharts(true);
      try {
        const chartResponse = await apiClient.get(
          `/profile/charts?daysBack=${daysBack}`
        );
        
        // Mapeo y ajuste de datos para Recharts
        const mappedData = (chartResponse.data.progression || []).map(
          (item) => ({
            // 1. Clave X (Eje): monthYear -> month
            month: item.monthYear,

            // 2. Duración: totalDurationSeconds -> totalDuration (en minutos)
            totalDuration: Math.round((item.totalDurationSeconds || 0) / 60),

            // 3. Mantener el resto de las claves
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
    return <div className="profile-container">Cargando perfil...</div>;
  if (error)
    return (
      <div
        className="profile-container error"
        style={{ color: "red", padding: "20px" }}
      >
        {error}
      </div>
    );

  // Lógica para mostrar los ejercicios más frecuentes (Top 5)
  const topExercises = stats.mostFrequentExercises
    ? Object.entries(stats.mostFrequentExercises)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
    : [];

  return (
    <div
      className="profile-container"
      style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}
    >
      <h1 style={{ color: "#007AFF" }}>Perfil de {stats.username}</h1>

      {/* A. ESTADÍSTICAS CLAVE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          margin: "20px 0",
          backgroundColor: "#f0f0f0",
          color: "#333",
          padding: "15px",
          borderRadius: "10px",
        }}
      >
        <div>
          🏋️ Total de Entrenos:{" "}
          <strong>{stats.totalWorkouts.toLocaleString()}</strong>
        </div>
        <div>
          🗓️ Miembro desde:{" "}
          <strong>{new Date(stats.memberSince).toLocaleDateString()}</strong>
        </div>
      </div>

      {/* B. EJERCICIOS MÁS FRECUENTES */}
      <div
        style={{
          marginBottom: "40px",
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "#000000ff",
        }}
      >
        <h2>🔥 Top 5 Ejercicios</h2>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {topExercises.map(([name, count], index) => (
            <li
              key={name}
              style={{
                margin: "8px 0",
                borderBottom: "1px dotted #eee",
                paddingBottom: "5px",
              }}
            >
              {index + 1}. **{name}** (Realizado {count} veces)
            </li>
          ))}
        </ul>
      </div>

      {/* C. BALANCE MUSCULAR (Gráfico de Barras) Y ANÁLISIS DE IA */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "40px",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <h3>🧬 Equilibrio Muscular del Mes</h3>
          <MuscleBalanceChart
            data={muscleVolume}
            title="Volumen por Grupo Muscular (30 días)"
          />
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: "#2c3e50",
            color: "#ecf0f1",
            padding: "20px",
            borderRadius: "10px",
            minHeight: "300px",
          }}
        >
          <h3>🧠 Análisis IA de Balance</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
            {aiAnalysis}
          </p>
        </div>
      </div>

      {/* D. GRÁFICOS GLOBALES */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <h2>📊 Progresión Global Mensual</h2>
          <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
            {/* Selector de MÉTRICA */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #007AFF",
                color: "#007AFF",
                fontWeight: "bold",
              }}
            >
              {METRIC_FILTERS.map((metric) => (
                <option key={metric.key} value={metric.key}>
                  {metric.label}
                </option>
              ))}
            </select>
            {/* Selector de TIEMPO */}
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(parseInt(e.target.value, 10))}
              style={{
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              {TIME_FILTERS.map((filter) => (
                <option key={filter.days} value={filter.days}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingCharts ? (
          <div
            style={{
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Cargando datos de la gráfica...
          </div>
        ) : (
          <div style={{ height: "400px", marginTop: "20px" }}>
            {globalProgressData.length > 0 ? (
              <ProfileChart
                data={globalProgressData}
                selectedMetric={selectedMetric}
              />
            ) : (
              <div
                style={{
                  height: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                }}
              >
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