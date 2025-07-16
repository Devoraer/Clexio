// 📁 frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './', // 💥 זה הכי חשוב לאלקטרון!
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
