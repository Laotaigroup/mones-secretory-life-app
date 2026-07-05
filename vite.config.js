import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/mones-secretory-life-app/',
  plugins: [react()],
})
