import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Fiscmind app.  The React plugin enables JSX
// transformation and fast refresh during development.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls during development to Netlify functions when running
      // via `netlify dev`.  Requests beginning with `/api` will be rewritten.
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true
      }
    }
  }
});