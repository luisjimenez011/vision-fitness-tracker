require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./src/routes/authRoutes')
const routineRoutes = require('./src/routes/routineRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const userRoutes = require('./src/routes/userRoutes'); 


// 1. Definir los orígenes permitidos
const allowedOrigins = [
    // La librería 'cors' ahora maneja correctamente el wildcard (*)
    // Esto permite cualquier subdominio de Vercel (Frontend App, Previews)
    'https://*.vercel.app', 
    
    // Orígenes locales para desarrollo
    'http://localhost:3000', 
    'http://localhost:5173' 
];

// 2. Opciones de configuración de CORS SIMPLIFICADAS
// Opciones de configuración de CORS (FINAL Y MÁS ROBUSTA)
const corsOptions = {
    origin: allowedOrigins,
    
    // Métodos necesarios para las peticiones REST
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    
    // Añadimos Max-Age: 1 hora
    maxAge: 3600, 
    
    // Permite tokens
    credentials: true, 
    
    // Encabezados
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], 
};

const app = express()

// Aplicar CORS (solución final)
app.use(cors(corsOptions)) 

app.use(express.json())

// Rutas (se mantiene la lógica de /api/... para consistencia, aunque Vercel ya rutea por ti)
app.use('/api/auth', authRoutes)
app.use('/api/routine', routineRoutes);
app.use('/api/workout', workoutRoutes); 
app.use('/api/profile', userRoutes); 


// ¡EL CAMBIO CLAVE PARA VERCEL!
// Exportar la aplicación Express como una función Serverless
module.exports = app;