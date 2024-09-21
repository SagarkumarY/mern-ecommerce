import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true, // Change origin of the host header to the target URL
        secure: false, // If you're using HTTP
      }
    }
  }
})
