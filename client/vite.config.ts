import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../server/dist',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    proxy: {
      '/bookmarks': 'http://localhost:8081',
      '/folders': 'http://localhost:8081',
      '/wallpaper': 'http://localhost:8081',
    },
  },
})
