import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-charts': ['recharts', 'd3', 'd3-sankey'],
          'vendor-utils': ['papaparse', 'clsx', 'tailwind-merge', 'lucide-react'],
        },
      },
    },
  },
});
