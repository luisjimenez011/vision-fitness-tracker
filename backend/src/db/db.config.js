// src/config/db.js
require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error("❌ FATAL: DATABASE_URL no está definida");
  process.exit(1);
}

// Crear pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // necesario para Supabase
  // 👇 Render usa IPv4, así que forzamos familia 4
  family: 4
});

// Comprobar la conexión al iniciar
pool.connect()
  .then(client => {
    console.log("✅ Conexión exitosa a Supabase PostgreSQL");
    client.release();
  })
  .catch(err => {
    console.error("❌ Error al conectar con la base de datos:", err.message);
    process.exit(1);
  });

module.exports = pool;
