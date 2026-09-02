import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this app from a /mones-secretory-life-app/ subpath, so
// asset URLs need that prefix. Vercel/Netlify serve from the domain root, so
// they need base '/'. The deploy workflow sets GH_PAGES=true for the Pages build.
export default defineConfig({
  base: process.env.GH_PAGES ? '/mones-secretory-life-app/' : '/',
  plugins: [react()],
})
