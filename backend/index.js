
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./src/routes/authRoutes')
const routineRoutes = require('./src/routes/routineRoutes');

const app = express()
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/routine', routineRoutes); 

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`)
})
