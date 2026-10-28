import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use '/' for custom domains, or '/repository-name/' for GitHub Pages default subdirectories.
  base: '/',
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})