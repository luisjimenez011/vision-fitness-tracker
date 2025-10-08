
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const authRoutes = require('./src/routes/authRoutes')

const app = express()
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`)
})
