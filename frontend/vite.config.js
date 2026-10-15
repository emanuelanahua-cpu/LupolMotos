import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', '')
  const BACKEND = env.VITE_BACKEND_URL || env.BACKEND_URL || 'http://localhost:8000'
  const PORT = Number(env.VITE_PORT) || 3000

  return {
    envDir: '../',
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: PORT,
      proxy: {
        '/api': BACKEND,      // datos y API del panel
        '/uploads': BACKEND,  // fotos subidas desde el panel
      },
    }
  }
})
