// Configuración del pool de conexiones PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');

const dns = require('dns');
// Render y Supabase solo necesitan esta variable, que incluye todos los detalles.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("FATAL ERROR: DATABASE_URL no está definida. ¡Conexión fallida!");
    // Es buena práctica salir si la conexión crítica falla
    process.exit(1); 
}

const pool = new Pool({
    connectionString: connectionString,
    // Configuración SSL necesaria para conexiones externas (Render a Supabase)
    //  SOLUCIÓN DEFINITIVA: Forzar la búsqueda de DNS solo para IPv4
    dnsLookup: (hostname, callback) => {
        // Le dice a Node que busque solo direcciones de la familia 4 (IPv4)
        dns.lookup(hostname, 4, callback); 
    },
    family: 4,
    ssl: {
      rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;