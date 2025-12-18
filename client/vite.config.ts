import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5173,
    proxy: {
      '/bookmarks': 'http://localhost:8081',
      '/folders': 'http://localhost:8081',
    },
  },
  preview: {
    port: 5000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
