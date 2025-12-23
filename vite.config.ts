
import { defineConfig } from 'vite';

export default defineConfig({
  // Menggunakan base './' memungkinkan aplikasi berjalan di subpath mana pun (misal: username.github.io/repo-name/)
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react', 'wavesurfer.js']
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
