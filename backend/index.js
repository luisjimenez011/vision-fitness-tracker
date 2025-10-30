require('dotenv').config()
const express = require('express')
const authRoutes = require('./src/routes/authRoutes')
const routineRoutes = require('./src/routes/routineRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const userRoutes = require('./src/routes/userRoutes'); 


const app = express()

// ***************************************************************
// SOLUCIÓN FINAL CORS: Middleware Manual y Único para Vercel
// ***************************************************************
app.use((req, res, next) => {
    // 1. Establecer dominios permitidos para el motor CORS del navegador
    const ALLOWED_ORIGIN = 'https://vision-fitness-tracker.vercel.app'; 
    const WILDCARD_ORIGIN = 'https://*.vercel.app'; 

    let origin = req.headers.origin;

    // 2. Determinar el origen dinámicamente:
    if (!origin || origin === 'null') {
        // Permitir llamadas sin origen (Postman, scripts, etc.)
        origin = WILDCARD_ORIGIN; 
    } else if (origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
        // Permitir el dominio de Vercel y local
        origin = req.headers.origin; 
    } else {
        // Fallback a un dominio fijo si no es uno de los esperados
        origin = ALLOWED_ORIGIN; 
    }

    // 3. Establecer TODOS los encabezados para OPTIONS y la Respuesta Real (POST/GET)
    // ESTO GARANTIZA que el Access-Control-Allow-Origin esté en la respuesta 200 OK.
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '3600'); 

    // 4. Manejar el OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        // Respondemos 204 No Content para que el navegador envíe el POST
        return res.sendStatus(204);
    }
    
    // 5. Continuar para peticiones POST/GET
    next();
});
// ***************************************************************

// IMPORTANTE: NO usamos app.use(cors(corsOptions)) aquí

app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/routine', routineRoutes);
app.use('/api/workout', workoutRoutes); 
app.use('/api/profile', userRoutes); 


// Exportar la aplicación Express como una función Serverless
module.exports = app;