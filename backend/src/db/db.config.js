// db.js (Corrección Final)
require('dotenv').config();
const { Pool } = require('pg');

// 1. Render nos proporciona la URL completa
const connectionString = process.env.DATABASE_URL; 

if (!connectionString) {
    console.error("FATAL ERROR: DATABASE_URL no está definida. ¡Conexión fallida!");
    // En el deploy, esto fallará si la variable no está (es una buena práctica)
    process.exit(1); 
}

const pool = new Pool({
    // 2. Usamos la cadena de conexión completa
    connectionString: connectionString, 
    
    // 3. Forzamos SSL, ya que la BD está en otro servidor (Supabase)
    ssl: { 
      // Esta línea es necesaria para evitar errores de certificado con servicios en la nube
      rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    // Esto te dará un error claro en los logs de Render si la conexión falla
    console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;