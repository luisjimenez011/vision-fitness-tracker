import React, { useState, useMemo } from 'react';


import {
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

// Importación de Iconos de Material-UI
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';


// ------------------------------------------------------------------
// Componente Modal para mostrar los detalles del entrenamiento de un día
// ------------------------------------------------------------------
const SelectedDayPanel = ({ log, onClose }) => {
    // No renderizar si no hay un log seleccionado
    if (!log) return null;

    // Cálculo de estadísticas
    const totalSets = log.log_data ? log.log_data.length : 0;
    // Obtiene el número de ejercicios únicos
    const uniqueExercises = [...new Set(log.log_data.map(data => data.exerciseName))].length;

    /**
     * Formatea la duración total de un entrenamiento de segundos a un formato legible (Xh Ym Zs).
     * @param {number} totalSeconds - Duración total en segundos.
     * @returns {string} Duración formateada.
     */
    const formatDuration = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let result = '';
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        // Muestra segundos si hay alguno o si la duración total es 0
        if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds}s`;
        
        // Si el resultado está vacío (duración 0), devuelve '0s'
        if (result.trim() === '') return '0s';
        
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
                Detalles del Entreno: <Box component="span" sx={{ color: 'primary.light' }}>{log.dateString}</Box>
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
                            {formatDuration(log.duration_seconds || 0)}
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
                            {/* Agrupa los sets por ejercicio para una mejor visualización de detalles */}
                            {log.log_data.reduce((acc, data) => {
                                const last = acc[acc.length - 1];
                                if (last && last.name === data.exerciseName) {
                                    last.sets.push(data);
                                } else {
                                    acc.push({ 
                                        name: data.exerciseName, 
                                        sets: [data] 
                                    });
                                }
                                return acc;
                            }, []).map((exerciseGroup, index, array) => (
                                <React.Fragment key={exerciseGroup.name}>
                                    <ListItem 
                                        disablePadding 
                                        sx={{ 
                                            flexDirection: 'column', 
                                            alignItems: 'flex-start',
                                            py: 0.8, 
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ color: 'primary.light', fontWeight: 'bold', mb: 0.5 }}>
                                            {exerciseGroup.name} ({exerciseGroup.sets.length} sets)
                                        </Typography>
                                        
                                        {exerciseGroup.sets.map((set, setIndex) => (
                                            <Typography 
                                                key={setIndex} 
                                                variant="caption" 
                                                component="div"
                                                sx={{ 
                                                    color: 'grey.400', 
                                                    ml: 1,
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    width: '100%'
                                                }}
                                            >
                                                <Box component="span" sx={{ width: 40, flexShrink: 0 }}>Set {setIndex + 1}:</Box>
                                                <Box component="span" sx={{ fontWeight: 'bold' }}>
                                                    {set.reps} reps X {set.weight}{set.isBodyweight ? ' BW' : ' kg'}
                                                </Box>
                                            </Typography>
                                        ))}
                                    </ListItem>
                                    {/* Divisor entre grupos de ejercicios */}
                                    {index < array.length - 1 && <Divider component="li" sx={{ borderColor: 'grey.700', my: 0.5 }} />}
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
// Componente Principal TrainingCalendar
// Muestra el historial de logs de entrenamiento en un calendario.
// ------------------------------------------------------------------
const TrainingCalendar = ({ logs = [], loading }) => {
    // Estado para la fecha seleccionada en el calendario
    const [selectedDate, setSelectedDate] = useState(null); 
    // Estado para el log de entrenamiento del día seleccionado
    const [selectedLog, setSelectedLog] = useState(null); 

    // --- Funciones de formato de fecha ---

    /**
     * Convierte cualquier fecha o string de fecha a un string "YYYY-MM-DD" basado en la hora local del usuario.
     * Esto asegura que la fecha mostrada en el calendario coincida con el día del entrenamiento local.
     * @param {Date|string} dateInput - La fecha a formatear.
     * @returns {string|null} Fecha en formato "YYYY-MM-DD" local o null.
     */
    const getLocalDayString = (dateInput) => {
        if (!dateInput) return null;
        
        let dateObject;

        if (typeof dateInput === 'string') {
            // Intenta normalizar el string para que new Date lo interprete correctamente.
            let dateToParse = dateInput.trim().replace(' ', 'T');
            if (dateToParse.includes('.')) {
                dateToParse = dateToParse.split('.')[0]; 
            }
            if (!dateToParse.includes('Z') && dateToParse.includes('T')) {
                // Asumimos UTC si no hay zona horaria para un timestamp, para evitar manipulación horaria no deseada.
                dateToParse += 'Z'; 
            } else if (!dateToParse.includes('T') && !dateToParse.includes('Z')) {
                // Si es solo fecha, se trata como medianoche local.
            }
            dateObject = new Date(dateToParse);

        } else if (dateInput instanceof Date) {
            dateObject = dateInput;
        } else {
            return null;
        }
        
        if (isNaN(dateObject.getTime())) return null;

        // Usa funciones locales para obtener el día en la zona horaria del usuario.
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`; 
    };


    // --- Procesamiento de Logs (Memorizado) ---
    const { allLogsProcessed, trainedDates } = useMemo(() => {
        if (!logs || logs.length === 0) {
            return { allLogsProcessed: [], trainedDates: [] };
        }
        
        // Objeto para agrupar logs por la fecha local ("YYYY-MM-DD")
        const logMap = {};
        
        logs.forEach(log => {
            // Obtiene el día local de la marca de tiempo de creación
            const dateString = getLocalDayString(log.created_at);
            
            if (dateString) {
                // Parsea log_data si es un string JSON, sino usa el objeto o un array vacío
                const parsedLogData = typeof log.log_data === 'string' && log.log_data.length > 0
                    ? JSON.parse(log.log_data)
                    : (log.log_data || []);
                
                // Almacena el log, priorizando el último encontrado para ese día si hay duplicados
                logMap[dateString] = { 
                    ...log, 
                    dateString, // Añade el string de fecha local al log
                    log_data: parsedLogData,
                };
            }
        });
        
        const allLogsProcessed = Object.values(logMap);
        
        // Array de fechas que tienen entrenamientos (formato YYYY-MM-DD LOCAL)
        const uniqueDates = allLogsProcessed.map(log => log.dateString);

        return { allLogsProcessed, trainedDates: uniqueDates };
    }, [logs]);


    // --- Manejador de Clic en el Día del Calendario ---
    const handleDayClick = (date) => {
        // 'date' es el objeto Date del día clicado (con la hora local a medianoche)
        setSelectedDate(date); 
        
        // Formatea el día clicado para buscar el log correspondiente
        const dayStringForComparison = getLocalDayString(date);

        // Busca el log de entrenamiento que coincida con la fecha local
        const logForDay = allLogsProcessed.find(log => log.dateString === dayStringForComparison);
        
        setSelectedLog(logForDay || null);
    };

    // Cierra el modal de detalles del log
    const closeModal = () => {
        setSelectedLog(null);
    };

    // ------------------------------------------------------------------
    // Lógica de Coloreado de Días del Calendario (Custom Day Renderer)
    // ------------------------------------------------------------------
    const renderDay = (dayProps) => {
        
        // Desestructura de forma segura los props necesarios del día
        const { day, outsideCurrentMonth: isOutsideMonth, ...pickersDayProps } = dayProps;

        // Verificación de día inválido para evitar errores
        if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
            return <PickersDay {...dayProps} disableMargin day={day} />;
        }
        
        // Obtiene el string de fecha local para comparación
        const dayString = getLocalDayString(day);
        
        // Determina si el día está entrenado y si es el día seleccionado para ver detalles
        const isTrained = trainedDates.includes(dayString);
        const isSelectedForDetails = selectedDate && getLocalDayString(selectedDate) === dayString;
        
        // Estilos para los días entrenados
        const trainedColor = 'secondary.dark'; 
        const trainedHover = 'secondary.main'; 
        
        return (
            <PickersDay 
                {...pickersDayProps} 
                disableMargin 
                day={day} // Pasa el objeto `day` original
                sx={{
                    // Estilos para días entrenados (dentro del mes)
                    ...(!isOutsideMonth && isTrained && {
                        backgroundColor: trainedColor, // Color de fondo para días con entrenamiento
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: trainedHover, 
                        },
                        // Mantiene el color de fondo si un día entrenado es seleccionado
                        '&.Mui-selected': { 
                            backgroundColor: trainedColor,
                        },
                    }),
                    
                    // Aplica un borde especial si es el día seleccionado (prioridad visual)
                    ...(!isOutsideMonth && isSelectedForDetails && {
                        border: '3px solid',
                        borderColor: 'warning.main', 
                        padding: 'calc(10px - 3px)', // Ajusta padding para compensar el borde
                        
                        // Estilo de fondo si está seleccionado pero no entrenado
                        ...(!isTrained && {
                            backgroundColor: 'grey.700',
                            color: 'white',
                        }),
                    }),
                    
                    // Estilo para días fuera del mes actual
                    '&.MuiPickersDay-dayOutsideMonth': {
                         color: 'grey.600',
                         backgroundColor: 'transparent',
                    },
                    
                    // Estilo base para días no entrenados pero seleccionados
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

    // Muestra el indicador de carga si los datos están pendientes
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, color: 'text.primary' }}>
                <CircularProgress color="primary" />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>Cargando historial de entrenamiento...</Typography>
            </Box>
        );
    }
    
    // Renderizado principal del calendario
    return (
        <Container 
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
                bgcolor: 'grey.800', 
                borderRadius: 2, 
                boxShadow: 3,
                color: '#fff' 
            }}>
                
                {/* Muestra un mensaje si no hay logs */}
                {logs.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            Aún no hay entrenamientos. ¡Empieza a registrar!
                        </Typography>
                    </Box>
                ) : (
                    // Calendario de MUI X
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DateCalendar
                            value={selectedDate}
                            onChange={handleDayClick}
                            // Asigna la función personalizada para renderizar los días
                            slots={{ day: renderDay }} 
                            disableFuture
                            sx={{
                                // Estilos de tema oscuro para el calendario
                                '.MuiPickersCalendarHeader-label': { color: 'primary.light', fontWeight: 'bold' },
                                '.MuiDayCalendar-weekDayLabel': { color: 'grey.400', fontWeight: '500' },
                                '.MuiPickersCalendarHeader-root': { color: 'white' },
                                '.Mui-disabled': { color: 'grey.600' },
                                '.MuiDayCalendar-header': { justifyContent: 'space-around' },
                                '.MuiPickersDay-root:not(.Mui-selected)': {
                                    color: 'grey.300', // Color de días por defecto
                                }
                            }}
                        />
                    </LocalizationProvider>
                )}
            </Box>

            {/* Modal de detalles del día seleccionado */}
            <SelectedDayPanel log={selectedLog} onClose={closeModal} />
        </Container>
    );
};

export default TrainingCalendar;