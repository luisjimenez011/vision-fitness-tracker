require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./src/routes/authRoutes')
const routineRoutes = require('./src/routes/routineRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const userRoutes = require('./src/routes/userRoutes'); 


const app = express()
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/routine', routineRoutes);
app.use('/api/workout', workoutRoutes); 
app.use('/api/profile', userRoutes); 


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`)
})