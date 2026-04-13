import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1600,
  },
  plugins: [react()],
  server: {
    host: true,
  },
})
