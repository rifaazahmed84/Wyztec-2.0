import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // npm run dev uses a standalone API. vercel dev owns function routing.
  server: process.env.VERCEL === '1' ? {} : {
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
  build: { chunkSizeWarningLimit: 600 },
});
