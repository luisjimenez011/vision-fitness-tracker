require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./src/routes/authRoutes')
const routineRoutes = require('./src/routes/routineRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const userRoutes = require('./src/routes/userRoutes'); 


// 1. Definir los patrones (strings fijos para local y la expresión regular para Vercel)
const fixedOrigins = [
    // Orígenes locales fijos
    'http://localhost:3000', 
    'http://localhost:5173',
];

// 2. Expresión regular para permitir CUALQUIER subdominio que termine en .vercel.app
// Esto coincide con tu dominio de app (vision-fitness-tracker.vercel.app) y el temporal (con IDs)
const vercelPattern = /\.vercel\.app$/;

// 3. Opciones de configuración de CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir si no hay origen (ej. Postman o llamadas internas)
        if (!origin) {
            return callback(null, true);
        }
        
        // Comprobar si es un origen fijo (local)
        if (fixedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Comprobar si coincide con el patrón de Vercel
        // La URL de Vercel (https://vision-fitness-tracker.vercel.app) pasará esta prueba
        if (vercelPattern.test(origin)) {
            return callback(null, true);
        }
        
        // Si no coincide con ninguna regla, denegar
        callback(new Error('Not allowed by CORS'));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, 
};

const app = express()

// Aplicar CORS con las opciones de lista blanca y Regex
app.use(cors(corsOptions)) 

app.use(express.json())

// Rutas
// Vercel está ruteando correctamente a esta función, por lo que estas rutas ahora deberían funcionar
app.use('/api/auth', authRoutes)
app.use('/api/routine', routineRoutes);
app.use('/api/workout', workoutRoutes); 
app.use('/api/profile', userRoutes); 


// ¡EL CAMBIO CLAVE PARA VERCEL!
// Esto asegura que Express se exporte como la función Serverless esperada por Vercel.
module.exports = app;