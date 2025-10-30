require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./src/routes/authRoutes')
const routineRoutes = require('./src/routes/routineRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const userRoutes = require('./src/routes/userRoutes'); 


// 1. Definir los orígenes permitidos (para la validación final del POST)
const allowedOrigins = [
    'https://*.vercel.app', 
    'http://localhost:3000', 
    'http://localhost:5173' 
];

// 2. Opciones de configuración de CORS (Solo para la solicitud POST/GET)
const corsOptions = {
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express()

// ***************************************************************
// BLOQUE DE SOLUCIÓN DE FALLO DE OPTIONS: FORZAR 204
// ***************************************************************
app.use((req, res, next) => {
    // Si es una solicitud OPTIONS, configuramos los encabezados manualmente y terminamos
    if (req.method === 'OPTIONS') {
        // Establecemos los encabezados de acceso para el navegador
        res.header('Access-Control-Allow-Origin', req.headers.origin || 'https://*.vercel.app');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '3600'); 
        
        // Respondemos 204 para que el navegador envíe el POST
        return res.sendStatus(204);
    }
    // Si no es OPTIONS, pasamos al siguiente middleware
    next();
});
// ***************************************************************

// Aplicar CORS para la validación de las peticiones POST/GET
app.use(cors(corsOptions)) 

app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/routine', routineRoutes);
app.use('/api/workout', workoutRoutes); 
app.use('/api/profile', userRoutes); 


// Exportar la aplicación Express como una función Serverless
module.exports = app;