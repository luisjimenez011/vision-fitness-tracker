import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient.js';

/**
 * Calcula el volumen total levantado para un log de entrenamiento dado.
 * El logData es un objeto donde las claves son IDs de ejercicios y los valores son arrays de sets.
 * @param {Object} logData - El objeto log_data (JSON decodificado)
 * @returns {number} Volumen total en kg o libras.
 */
const calculateTotalVolume = (logData) => {
    let totalVolume = 0;

    // logData es un objeto donde las claves son IDs de ejercicios
    for (const exerciseId in logData) {
        // exerciseSets es un array de sets registrados para un ejercicio
        const exerciseSets = logData[exerciseId]; 
        
        // Iterar sobre cada set registrado
        // Se añade una verificación adicional para asegurar que logData es un objeto
        if (Array.isArray(exerciseSets)) {
            exerciseSets.forEach(set => {
                // Asegúrate de que los sets tengan peso y repeticiones válidas y sean números
                if (set.weight && set.reps && typeof set.weight === 'number' && typeof set.reps === 'number') {
                    totalVolume += set.weight * set.reps;
                }
            });
        }
    }

    return totalVolume;
};


function DashboardPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                // Llama al endpoint GET /api/workout/logs
                const response = await apiClient.get('/workout/logs');
                setLogs(response.data);
            } catch (err) {
                // Manejo de error específico (ej. si el token caducó o el servidor falla)
                console.error('Error al cargar los logs de entrenamiento:', err);
                setError('Error al cargar el historial. Asegúrate de estar conectado.');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Dashboard - Historial de Entrenamientos</h1>
            {/* El botón de Logout debería estar en el Navbar, pero lo dejamos aquí por ahora */}
            <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Cerrar Sesión</button>
            
            {loading && <p>Cargando historial...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {!loading && !error && (
                logs.length === 0 ? (
                    <p>No tienes entrenamientos registrados. ¡Empieza una rutina!</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.5em' }}>Entrenamientos Recientes</h2>
                        
                        {logs.map(log => {
                            const minutes = Math.floor(log.duration_seconds / 60);
                            const seconds = log.duration_seconds % 60;
                            
                            // 1. CÁLCULO DE VOLUMEN
                            const volume = calculateTotalVolume(log.log_data); 

                            return (
                                <div key={log.id} style={{ 
                                    border: '1px solid #ccc', 
                                    borderRadius: '8px', 
                                    padding: '15px', 
                                    margin: '10px 0', 
                                    width: '80%', 
                                    maxWidth: '600px',
                                    textAlign: 'left' // Alineamos el contenido a la izquierda para mejor lectura
                                }}>
                                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                        {log.day_name || `Rutina #${log.routine_id}`}
                                    </h3>
                                    
                                    <p><strong>Volumen Total:</strong> **{volume.toLocaleString()} kg**</p>
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