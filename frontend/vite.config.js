import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: apiUrl,
        changeOrigin: true,
        secure: false
      }
    }
  }
})

