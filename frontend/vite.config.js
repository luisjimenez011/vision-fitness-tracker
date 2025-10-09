import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Añadimos esta sección para forzar la compatibilidad con Node.js 18.x
  build: {
    target: 'es2020', // Esto asegura que la compilación use sintaxis compatible
  },
})