import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    cors: true,
    proxy: {
      '/api': {
        target: import.meta.env.VITE_SERVER_LOCATION,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
},
  plugins: [react()],
})
