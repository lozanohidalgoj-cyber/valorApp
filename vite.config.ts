import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types/index.ts'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@context': path.resolve(__dirname, './src/context'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - librerías externas
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'icons-vendor': ['lucide-react'],
          'utils-vendor': ['xlsx'],

          // Feature chunks - páginas grandes
          expediente: [
            './src/pages/ExpedienteTipoV/ExpedienteTipoV.tsx',
            './src/pages/ExpedienteTipoV/components/VistaAnomalias.tsx',
            './src/pages/ExpedienteTipoV/components/VistaGrafico.tsx',
          ],
          'saldo-atr': ['./src/pages/SaldoATR/SaldoATR.tsx'],

          // Services chunks - lógica de negocio
          'services-analisis': [
            './src/services/analisisConsumoService.ts',
            './src/services/clasificadorExpedienteService.ts',
            './src/services/detectarInicioAnomaliaService.ts',
          ],
          'services-data': [
            './src/services/importService.ts',
            './src/services/exportacionService.ts',
            './src/services/dataService.ts',
          ],
        },
      },
    },
    // Aumentar límite de advertencia a 600KB (desde 500KB)
    chunkSizeWarningLimit: 600,
  },
});
