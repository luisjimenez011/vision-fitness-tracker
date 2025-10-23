import React, { useState, useMemo } from 'react';

// ⬇️ IMPORTACIONES DE MUI & MUI X
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

// Iconos MUI
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';


// ------------------------------------------------------------------
// Panel de Contenido del Modal (SelectedDayPanel)
// ------------------------------------------------------------------
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
        // Mostrar segundos solo si no hay horas ni minutos, o si es un número redondo
        if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds}s`;
        
        // Si dura 0, devuelve '0s'
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
                            {/* AGRUPAR sets por ejercicio para una mejor visualización del detalle */}
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
                            }, []).map((exerciseGroup, index) => (
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
                                    {/* Divisor */}
                                    {index < uniqueExercises - 1 && <Divider component="li" sx={{ borderColor: 'grey.700', my: 0.5 }} />}
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
// ------------------------------------------------------------------
const TrainingCalendar = ({ logs = [], loading }) => {
    const [selectedDate, setSelectedDate] = useState(null); 
    const [selectedLog, setSelectedLog] = useState(null); 

    // --- Funciones de formato de fecha (Lógica clave) ---

    // 🟢 FUNCIÓN MEJORADA: Convierte cualquier fecha/string a un string "YYYY-MM-DD" basado en la HORA LOCAL.
    const getLocalDayString = (dateInput) => {
        if (!dateInput) return null;
        
        let dateObject;

        if (typeof dateInput === 'string') {
            // Reemplazamos espacio por 'T' para forzar el formato ISO 8601,
            // y agregamos 'Z' si no hay información de zona horaria, asumiendo UTC.
            let dateToParse = dateInput.trim().replace(' ', 'T');
            if (dateToParse.includes('.')) {
                dateToParse = dateToParse.split('.')[0]; 
            }
            if (!dateToParse.includes('Z') && dateToParse.includes('T')) {
                // Si la DB no pone Z, asumimos que es UTC para evitar la manipulación horaria.
                dateToParse += 'Z'; 
            } else if (!dateToParse.includes('T') && !dateToParse.includes('Z')) {
                 // Si es solo fecha, lo dejamos así para que new Date lo trate como medianoche local
            }
            dateObject = new Date(dateToParse);

        } else if (dateInput instanceof Date) {
            dateObject = dateInput;
        } else {
            return null;
        }
        
        if (isNaN(dateObject.getTime())) return null;

        // Usamos funciones locales para obtener el día tal como se ve en la zona horaria del usuario.
        // Formato: 2025-10-07
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, '0');
        const day = String(dateObject.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`; 
    };


    // 🟢 PROCESAMIENTO DE DATOS CON useMemo (MANTENIDO)
    const { allLogsProcessed, trainedDates } = useMemo(() => {
        if (!logs || logs.length === 0) {
            return { allLogsProcessed: [], trainedDates: [] };
        }
        
        // Usamos un objeto para agrupar logs que caen en el mismo día local
        const logMap = {};
        
        logs.forEach(log => {
            // Usamos la función LocalDayString para obtener el día del log de la DB
            const dateString = getLocalDayString(log.created_at);
            
            if (dateString) {
                const parsedLogData = typeof log.log_data === 'string' && log.log_data.length > 0
                    ? JSON.parse(log.log_data)
                    : (log.log_data || []);
                
                // Si hay logs duplicados en el mismo día (dos sesiones de entrenamiento), 
                // priorizamos el log más reciente o los fusionamos si fuera necesario.
                // Aquí, simplemente reemplazamos con el último log encontrado para ese día.
                logMap[dateString] = { 
                    ...log, 
                    dateString, 
                    log_data: parsedLogData,
                    // Si tienes múltiples logs por día, podrías sumar duraciones, etc.
                };
            }
        });
        
        const allLogsProcessed = Object.values(logMap);
        
        // Crea un array único de las fechas que tienen logs (formato YYYY-MM-DD LOCAL)
        const uniqueDates = allLogsProcessed.map(log => log.dateString);

        return { allLogsProcessed, trainedDates: uniqueDates };
    }, [logs]);


    // --- Manejador de Eventos para el Calendario de MUI X ---
    const handleDayClick = (date) => {
        // 'date' es el objeto Date que devuelve el calendario (hora local)
        setSelectedDate(date); 
        
        // Obtenemos la fecha del día clicado en formato YYYY-MM-DD LOCAL
        const dayStringForComparison = getLocalDayString(date);

        // Buscamos el log con esa fecha de entrenamiento (YYYY-MM-DD LOCAL)
        // Usamos el Map del useMemo para una búsqueda eficiente si hubiera más lógica
        const logForDay = allLogsProcessed.find(log => log.dateString === dayStringForComparison);
        
        setSelectedLog(logForDay || null);
    };

    const closeModal = () => {
        setSelectedLog(null);
    };

    // ------------------------------------------------------------------
    // --- Lógica de Coloreado (renderDay) - MANTENIDA
    // ------------------------------------------------------------------
    const renderDay = (dayProps) => {
        
        // 🔑 Destructuramos de forma segura los props necesarios
        const { day, outsideCurrentMonth: isOutsideMonth, ...pickersDayProps } = dayProps;

        // 🛑 Verificación de día inválido
        if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
            return <PickersDay {...dayProps} disableMargin day={day} />;
        }
        
        // Obtenemos el día formateado por el calendario (YYYY-MM-DD LOCAL)
        const dayString = getLocalDayString(day);
        
        // Comprobamos si el día existe en la lista de fechas entrenadas (YYYY-MM-DD LOCAL)
        const isTrained = trainedDates.includes(dayString);
        
        // Comprobamos si es el día actualmente seleccionado
        const isSelectedForDetails = selectedDate && getLocalDayString(selectedDate) === dayString;
        
        // ** COLORES **
        const trainedColor = 'secondary.dark'; 
        const trainedHover = 'secondary.main'; 
        
        return (
            <PickersDay 
                {...pickersDayProps} 
                disableMargin 
                day={day} // Asegúrate de pasar el objeto `day` original
                sx={{
                    // Colorear SOLO días dentro del mes que están entrenados
                    ...(!isOutsideMonth && isTrained && {
                        backgroundColor: trainedColor, // ⬅️ Color Rosa Aplicado
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: trainedHover, 
                        },
                        // Mantenemos el fondo del día entrenado si es seleccionado
                        '&.Mui-selected': { 
                            backgroundColor: trainedColor,
                        },
                    }),
                    
                    // Aplicar borde naranja si es el día seleccionado (prioridad visual)
                    ...(!isOutsideMonth && isSelectedForDetails && {
                        border: '3px solid',
                        borderColor: 'warning.main', 
                        padding: 'calc(10px - 3px)', 
                        
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
                            // Uso correcto de slots para el día
                            slots={{ day: renderDay }} 
                            disableFuture
                            sx={{
                                // Estilos del calendario para temas oscuros (mejor contraste)
                                '.MuiPickersCalendarHeader-label': { color: 'primary.light', fontWeight: 'bold' },
                                '.MuiDayCalendar-weekDayLabel': { color: 'grey.400', fontWeight: '500' },
                                '.MuiPickersCalendarHeader-root': { color: 'white' },
                                '.Mui-disabled': { color: 'grey.600' },
                                '.MuiDayCalendar-header': { justifyContent: 'space-around' },
                                // Ajuste fino para el color de los días (para que no se vean demasiado tenues)
                                '.MuiPickersDay-root:not(.Mui-selected)': {
                                    color: 'grey.300',
                                }
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