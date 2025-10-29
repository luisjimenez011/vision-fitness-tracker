require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./src/routes/authRoutes')
const routineRoutes = require('./src/routes/routineRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const userRoutes = require('./src/routes/userRoutes'); 


// 1. Definir el origen(es) permitido(s)
const allowedOrigins = [
    'https://vision-fitness-tracker-frontend-5zew4ba6c-luisjims-projects.vercel.app', 
    
    // Orígenes locales para desarrollo
    'http://localhost:3000', 
    'http://localhost:5173' 
];

// 2. Opciones de configuración de CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir el origen si está en la lista blanca O si es una solicitud sin origen (local/Postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, 
};

const app = express()
// 3. Aplicar CORS con las opciones de lista blanca
app.use(cors(corsOptions)) 

app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/routine', routineRoutes);
app.use('/api/workout', workoutRoutes); 
app.use('/api/profile', userRoutes); 


// ¡EL CAMBIO CLAVE PARA VERCEL!
module.exports = app;