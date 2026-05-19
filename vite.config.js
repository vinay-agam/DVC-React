import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/cards': {
        target: 'https://www.instaviz.me',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})
