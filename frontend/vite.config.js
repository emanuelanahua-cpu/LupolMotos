import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Cambia el puerto si tu backend corre en otro (por defecto 8000)
const BACKEND = 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': BACKEND,      // datos y API del panel
      '/uploads': BACKEND,  // fotos subidas desde el panel
    },
  }
})
