// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // THIS IS THE CRITICAL LINE
  // It must start and end with a slash, and be your repository name.
  base: '/three-js-app/',
  build: {
    outDir: 'dist',
  },
});