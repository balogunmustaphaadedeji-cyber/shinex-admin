import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SHINEX Admin — a completely separate, independently deployable project
// from the user marketplace app. Desktop-first; no PWA needed here.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 }
});
