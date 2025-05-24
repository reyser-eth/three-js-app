// vite.config.ts (or vite.config.js)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace '<YOUR_REPOSITORY_NAME>' with the actual name of your GitHub repository.
// For example, if your repo is github.com/your-username/my-3d-app,
// then base should be '/my-3d-app/'.
const REPO_NAME = 'three-js-app'; // <-- IMPORTANT: Change this to your repository name!

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`, // This tells Vite the base public path when building
  build: {
    outDir: 'dist', // Default build output directory for Vite
  },
});