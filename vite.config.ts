import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base must match the exact GitHub repository name for GitHub Pages
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' ? '/Maasrot/' : '/',
}));
