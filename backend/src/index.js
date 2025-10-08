require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
// ...aquí se importarán rutas

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`)
})
