import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
    // --- Add this Proxy Section ---
    proxy: {
      // Directs any request starting with /api to your backend
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        // Optional: removes /api from the path before sending to backend
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
      // Optional: Proxy WebSockets during development
      '/socket.io': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
  },
})