import React, { useState, useEffect, useMemo } from 'react';
// Eliminamos la importación de apiClient, ya que ahora recibimos los datos por props
// import apiClient from '../api/apiClient'; 

// ⬇️ IMPORTACIONES DE MUI & MUI X
import {
    // Importaciones necesarias de MUI para el diseño del calendario y el modal
    Container,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    Divider,
} from '@mui/material';
import { DateCalendar, LocalizationProvider, PickersDay } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale'; 

// Iconos MUI (Mantenidos)
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';

// ------------------------------------------------------------------
// 🛑 Panel de Contenido del Modal (Mantenido)
// ------------------------------------------------------------------
// *Mantendremos el SelectedDayPanel idéntico para no repetir código*
const SelectedDayPanel = ({ log, onClose }) => {
    if (!log) return null;

    const totalSets = log.log_data ? log.log_data.length : 0;
    const uniqueExercises = [...new Set(log.log_data.map(data => data.exerciseName))].length;

    const formatDuration = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let result = '';
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        result += `${seconds}s`;
        return result.trim();
    };

    return (
        <Dialog 
            open={!!log} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ 
                sx: { 
                    backgroundColor: 'grey.900',
                    color: '#fff', 
                    borderRadius: 3,
                    boxShadow: 8,
                } 
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: '2px solid', 
                borderColor: 'secondary.main',
                pb: 1.5,
                fontWeight: 'bold'
            }}>
                <EventNoteIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'secondary.main' }} />
                Detalles del Entrenamiento: <Box component="span" sx={{ color: 'primary.light' }}>{log.dateString}</Box>
            </DialogTitle>
            
            <DialogContent dividers sx={{ borderColor: 'grey.800' }}>
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                    <Box>
                        <Typography variant="body2" color="secondary.light" sx={{ fontWeight: 'bold' }}>Rutina:</Typography>
                        <Typography variant="body1">{log.day_name}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2" color="secondary.light" sx={{ fontWeight: 'bold' }}>Duración:</Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.light' }} />
                            {formatDuration(log.duration_seconds)}
                        </Typography>
                    </Box>
                </Box>
                
                {log.log_data && log.log_data.length > 0 ? (
                    <Box sx={{ bgcolor: 'grey.800', p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                            <FitnessCenterIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: 'error.light' }} />
                            Ejercicios ({uniqueExercises}): {totalSets} sets totales
                        </Typography>
                        <List dense sx={{ 
                            maxHeight: 200, 
                            overflowY: 'auto', 
                            p: 0,
                            pr: 1, 
                        }}>
                            {log.log_data.map((data, index) => (
                                <React.Fragment key={index}>
                                    <ListItem disablePadding sx={{ py: 0.5, px: 0, justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: 'grey.400', flexGrow: 1 }}>
                                            <Box component="strong" sx={{ color: '#fff' }}>{data.exerciseName}</Box>
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'primary.light', fontWeight: 'bold' }}>
                                            {data.reps} reps @ {data.weight}{data.isBodyweight ? ' BW' : ' kg'}
                                        </Typography>
                                    </ListItem>
                                    {index < totalSets - 1 && <Divider component="li" sx={{ borderColor: 'grey.700' }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Box>
                ) : (
                    <Alert severity="info" sx={{ bgcolor: 'grey.800', color: 'grey.200' }}>
                        No se registraron sets para esta sesión de entrenamiento.
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ borderTop: '1px solid', borderColor: 'grey.800' }}>
                <Button 
                    onClick={onClose} 
                    color="secondary" 
                    variant="contained" 
                    startIcon={<CloseIcon />}
                    sx={{ fontWeight: 'bold' }} 
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// ------------------------------------------------------------------
// 🛑 Componente Principal TrainingCalendar
// ------------------------------------------------------------------
// 🔑 Acepta logs y estados de carga como props
const TrainingCalendar = ({ logs = [], loading }) => {
    // Eliminamos el estado allLogs y trainedDates, que se calcularán a partir de logs.
    const [selectedDate, setSelectedDate] = useState(null); 
    const [selectedLog, setSelectedLog] = useState(null); 

    // --- Funciones de formato de fecha (Lógica clave UTC) ---

    // Función para obtener el día YYYY-MM-DD del log usando UTC para evitar desfase de zona horaria
    const formatDateToDayFromDb = (dateString) => {
        if (!dateString) return null;
        
        // Añade 'T00:00:00Z' si no es un formato ISO completo para forzar la interpretación UTC 
        // y evitar el desfase por zona horaria local.
        const dateToParse = dateString.includes('T') ? dateString : dateString + 'T00:00:00Z';
        const dateObject = new Date(dateToParse); 
        
        if (isNaN(dateObject.getTime())) return null;

        // Usamos las funciones UTC para extraer el día
        const year = dateObject.getUTCFullYear();
        const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`; // Formato: 2025-10-21
    };

    // Función para formatear la fecha del objeto Date del calendario (usa hora local del usuario)
    const formatDateObjectToDay = (dateObject) => {
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Formato: 2025-10-21
    }

    // 🔑 PROCESAMIENTO DE DATOS CON useMemo
    // Esto se ejecuta solo cuando la prop 'logs' cambia.
    const { allLogsProcessed, trainedDates } = useMemo(() => {
        if (!logs || logs.length === 0) {
            return { allLogsProcessed: [], trainedDates: [] };
        }
        
        const processedLogs = logs.map(log => {
            const dateString = formatDateToDayFromDb(log.created_at);
            // Aseguramos que log_data sea un objeto/array
            const parsedLogData = typeof log.log_data === 'string' && log.log_data.length > 0
                ? JSON.parse(log.log_data)
                : (log.log_data || []);
            
            return { ...log, dateString, log_data: parsedLogData };
        });
        
        // Crea un array único de las fechas que tienen logs (formato YYYY-MM-DD UTC)
        const allMappedDates = processedLogs.map(log => log.dateString);
        const uniqueDates = [...new Set(allMappedDates)].filter(Boolean);

        return { allLogsProcessed: processedLogs, trainedDates: uniqueDates };
    }, [logs]); // Se recalcula si la prop 'logs' cambia


    // --- Manejador de Eventos para el Calendario de MUI X ---
    const handleDayClick = (date) => {
        setSelectedDate(date); 
        
        // Usamos la hora local para formatear la fecha del día clicado
        const dayString = formatDateObjectToDay(date);

        // Busca el log correspondiente al día formateado 
        // Usamos find() para encontrar el primer log de ese día (si hay varios)
        const logForDay = allLogsProcessed.find(log => log.dateString === dayString);
        
        setSelectedLog(logForDay || null);
    };

    const closeModal = () => {
        setSelectedLog(null);
    };

    // --- 🔑 Lógica de Coloreado (renderDay) ---
    const renderDay = (day, selectedDays, pickersDayProps) => {
        // Obtenemos el día formateado por el calendario (local)
        const dayString = formatDateObjectToDay(day);
        
        // 🔑 Comprobamos si el día local del calendario existe en la lista de fechas entrenadas (UTC-ajustado)
        const isTrained = trainedDates.includes(dayString);
        
        // Comprobamos si es el día actualmente seleccionado (para el borde naranja)
        const isSelectedForDetails = selectedDate && formatDateObjectToDay(selectedDate) === dayString;
        
        const isOutsideMonth = pickersDayProps.outsideCurrentMonth;

        return (
            <PickersDay 
                {...pickersDayProps} 
                disableMargin 
                sx={{
                    // Colorear SOLO días dentro del mes que están entrenados
                    ...(!isOutsideMonth && isTrained && {
                        backgroundColor: 'success.dark',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: 'success.main',
                        },
                        // Mantenemos el fondo de éxito si el día actual está entrenado
                        '&.Mui-selected': { 
                            backgroundColor: 'success.dark',
                        },
                    }),
                    
                    // Aplicar borde naranja si es el día seleccionado (prioridad visual)
                    ...(!isOutsideMonth && isSelectedForDetails && {
                        border: '3px solid',
                        borderColor: 'warning.main', 
                        padding: 'calc(10px - 3px)', // Ajustar padding
                        // Si no está entrenado, le damos un fondo oscuro para contrastar el borde
                        ...(!isTrained && {
                            backgroundColor: 'grey.700',
                            color: 'white',
                        }),
                    }),
                    
                    // Días de otros meses (gris tenue)
                    '&.MuiPickersDay-dayOutsideMonth': {
                         color: 'grey.600',
                         backgroundColor: 'transparent',
                    },
                    
                    // Estilo base para días no entrenados pero seleccionados (borde azul oscuro por defecto de MUI)
                    '&.Mui-selected:not(.MuiPickersDay-dayOutsideMonth)': {
                        ...(!isTrained && {
                            backgroundColor: 'primary.dark',
                        }),
                        color: 'white',
                    }
                }}
            />
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, color: 'text.primary' }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Cargando historial de entrenamiento...</Typography>
            </Box>
        );
    }
    
    return (
        <Container 
            // Quitamos maxWidth, minHeight, y colores de fondo/texto ya definidos en el padre (Card)
            component="main" 
            sx={{ 
                py: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
            }}
        >
            
            <Box sx={{ 
                width: '100%', 
                maxWidth: 600, 
                p: 2, 
                bgcolor: 'grey.800', // Un fondo diferente dentro de la Card
                borderRadius: 2, 
                boxShadow: 3,
                color: '#fff' // Aseguramos que el texto dentro del calendario sea blanco
            }}>
                
                {logs.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            Aún no hay entrenamientos. ¡Empieza a registrar!
                        </Typography>
                    </Box>
                ) : (
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DateCalendar
                            value={selectedDate}
                            onChange={handleDayClick}
                            renderDay={renderDay}
                            disableFuture
                            sx={{
                                // Ajustes de estilo para encabezados y días de la semana
                                '.MuiPickersCalendarHeader-label': { color: 'primary.light', fontWeight: 'bold' },
                                '.MuiDayCalendar-weekDayLabel': { color: 'grey.400', fontWeight: '500' },
                                '.MuiPickersCalendarHeader-root': { color: 'white' },
                                '.Mui-disabled': { color: 'grey.600' },
                            }}
                        />
                    </LocalizationProvider>
                )}
            </Box>

            <SelectedDayPanel log={selectedLog} onClose={closeModal} />
            
          
        </Container>
    );
};

export default TrainingCalendar;