import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import apiClient from '../api/apiClient';

// ------------------------------------------------------------------
// 🛑 Componente Base Modal (Diseñado para un tema oscuro)
// ------------------------------------------------------------------
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semi-transparente
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000 // Asegura que esté por encima de otros elementos
        }}>
            <div style={{
                backgroundColor: '#1e1e1e', // Fondo del modal oscuro
                padding: '25px',
                borderRadius: '10px',
                maxWidth: '90%',
                maxHeight: '90%',
                width: '500px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                color: '#fff'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#90ee90', // Color verde
                        fontSize: '1.5em',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

// ------------------------------------------------------------------
// 🛑 Panel de Contenido del Modal (Detalle del Log)
// ------------------------------------------------------------------
const SelectedDayPanel = ({ log }) => {
    if (!log) return null;

    const totalExercises = log.log_data ? log.log_data.length : 0;

    return (
        <div>
            <h3 style={{ borderBottom: '2px solid #90ee90', paddingBottom: '10px', marginBottom: '15px' }}>
                Detalles del Entrenamiento: {log.dateString}
            </h3>
            <p><strong>Rutina:</strong> {log.day_name}</p>
            <p><strong>Duración:</strong> {log.duration_seconds} segundos</p>
            
            {totalExercises > 0 ? (
                <>
                    <p style={{ marginTop: '15px' }}><strong>Ejercicios ({totalExercises}):</strong></p>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
                            {log.log_data.map((data, index) => (
                                <li key={index} style={{ marginBottom: '5px' }}>
                                    **{data.exerciseName}**: {data.reps} reps @ {data.weight} kg
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : (
                <p style={{ color: '#aaa', marginTop: '10px' }}>No hay detalles de ejercicios registrados para este log.</p>
            )}
        </div>
    );
};


// ------------------------------------------------------------------
// 🛑 Componente Principal TrainingCalendar
// ------------------------------------------------------------------
const TrainingCalendar = () => {
    const [allLogs, setAllLogs] = useState([]);
    const [trainedDates, setTrainedDates] = useState([]); 
    const [selectedLog, setSelectedLog] = useState(null); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Funciones de formato de fecha (sin cambios, ya están optimizadas)

    const formatDateToDayFromDb = (dateString) => {
        if (!dateString) return null;
        const dateObject = new Date(dateString); 
        
        if (isNaN(dateObject)) return null;

        const year = dateObject.getUTCFullYear();
        const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const formatDateObjectToDay = (dateObject) => {
        return new Intl.DateTimeFormat('en-CA', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }).format(dateObject);
    }

    // useEffect para la carga inicial de datos (sin cambios)
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/workout/logs'); 
                
                let logsWithDateString = [];
                let dates = [];

                if (Array.isArray(response.data)) {
                    logsWithDateString = response.data.map(log => {
                        const dateString = formatDateToDayFromDb(log.created_at);
                        return { ...log, dateString };
                    });
                    
                    const allMappedDates = logsWithDateString.map(log => log.dateString);
                    dates = [...new Set(allMappedDates)].filter(Boolean);
                }
                
                setAllLogs(logsWithDateString);
                setTrainedDates(dates);
                setError(null);
                
            } catch (err) {
                console.error('Error al obtener o procesar el historial de entrenamiento. Detalle del error:', err);
                const detailedError = err.message || 'Error desconocido al procesar datos.';
                setError(`Error al cargar el historial. Revise la consola para detalles. Mensaje: ${detailedError}`);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    /**
     * Manejador de eventos al hacer clic en un día del calendario.
     */
    const handleDayClick = (date) => {
        const dayString = formatDateObjectToDay(date);

        if (trainedDates.includes(dayString)) {
            // Busca y establece el log para abrir el modal
            const logForDay = allLogs.find(log => log.dateString === dayString);
            setSelectedLog(logForDay);
        } else {
            // Si hacen clic en un día sin entrenamiento, asegúrate de que el modal está cerrado
            setSelectedLog(null);
        }
    };

    /**
     * Cierra el Modal al limpiar el estado selectedLog
     */
    const closeModal = () => {
        setSelectedLog(null);
    };

    /**
     * Aplica la clase CSS 'trained-day' a las celdas que coinciden con los logs.
     */
    const tileClassName = ({ date, view }) => {
        if (view !== 'month') return null;
        
        const dayToCheck = formatDateObjectToDay(date);
        const isSelected = selectedLog && selectedLog.dateString === dayToCheck;

        let classes = '';
        if (trainedDates.includes(dayToCheck)) {
            classes += ' trained-day';
        }
        if (isSelected) {
            classes += ' selected-day';
        }
        
        return classes.trim() || null;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px', color: '#fff' }}>Cargando historial de entrenamiento...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
    }
    
    return (
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', color: '#fff' }}>Historial de Consistencia</h2>
            <div style={{ width: '100%', maxWidth: '600px' }}>
                <Calendar
                    tileClassName={tileClassName} 
                    locale="es-ES" 
                    maxDetail="month" 
                    onClickDay={handleDayClick} 
                />
            </div>

            {/* 🛑 IMPLEMENTACIÓN DEL MODAL */}
            <Modal isOpen={!!selectedLog} onClose={closeModal}>
                <SelectedDayPanel log={selectedLog} />
            </Modal>
            
            <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#aaa' }}>
                Los días en verde tienen registro de entrenamiento. Haz clic para ver los detalles.
            </p>
        </div>
    );
};

export default TrainingCalendar;