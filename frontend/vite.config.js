import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins:
   [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'build', // Output to build folder for consistency with Vercel
    chunkSizeWarningLimit: Infinity // Disable chunk size warnings
  }
})
