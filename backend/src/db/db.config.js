// Configuración del pool de conexiones PostgreSQL
require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err)
})

module.exports = pool
