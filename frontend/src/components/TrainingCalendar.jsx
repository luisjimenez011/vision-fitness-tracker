import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import apiClient from '../api/apiClient';

const TrainingCalendar = () => {
    const [trainedDates, setTrainedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Función que toma la marca de tiempo ISO 8601 de la BD y la convierte a 'YYYY-MM-DD'.
     */
    const formatDateToDayFromDb = (dateString) => {
        if (!dateString) return null;

        const dateObject = new Date(dateString); 
        
        if (isNaN(dateObject)) {
             console.error("Error de formato: La cadena no es una fecha válida:", dateString);
             return null;
        }

        // Usamos los métodos UTC para obtener los componentes de la fecha.
        const year = dateObject.getUTCFullYear();
        const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    /**
     * Función que toma un objeto Date (del calendario) y lo formatea a 'YYYY-MM-DD' local
     * para la comparación.
     */
    const formatDateObjectToDay = (dateObject) => {
        return new Intl.DateTimeFormat('en-CA', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }).format(dateObject);
    }

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/workout/logs'); 
                
                let dates = [];
                if (Array.isArray(response.data)) {
                    // 1. Mapear y obtener un Array de fechas (incluyendo nulls si hay errores)
                    const mappedDates = response.data.map(log => formatDateToDayFromDb(log.created_at));
                    
                    // 2. Eliminar duplicados creando y luego extendiendo el Set a un Array
                    const uniqueDates = [...new Set(mappedDates)];
                    
                    // 3. 🛑 CORRECCIÓN: Aplicar filter(Boolean) a este Array.
                    dates = uniqueDates.filter(Boolean);
                }

                setTrainedDates(dates);
                setError(null);
                console.log("Fechas de entrenamiento cargadas (trainedDates):", dates);
                
            } catch (err) {
                console.error('Error procesando el historial de entrenamiento. Detalle del error:', err);
                
                // Aseguramos que el mensaje de error es informativo.
                const detailedError = err.message || 'Error desconocido al procesar datos.';
                setError(`Error al cargar el historial. Revise la consola para detalles. Mensaje: ${detailedError}`);
                
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const tileClassName = ({ date, view }) => {
        if (view !== 'month') return null;
        
        const dayToCheck = formatDateObjectToDay(date);

        if (trainedDates.includes(dayToCheck)) {
            return 'trained-day'; 
        }
        
        return null;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Cargando historial de entrenamiento...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
    }
    
    return (
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Historial de Consistencia</h2>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                <Calendar
                    tileClassName={tileClassName} 
                    locale="es-ES" 
                    maxDetail="month" 
                />
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
                Los días entrenados están marcados internamente con la clase CSS **`.trained-day`**.
            </p>
        </div>
    );
};

export default TrainingCalendar;