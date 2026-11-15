import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const backendDirectory = fileURLToPath(new URL('../backend', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const backendEnv = loadEnv(mode, backendDirectory, '');
  const backendPort = backendEnv.PORT || '5000';

  return {
    plugins: [react()],
    css: {
      postcss: {}
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});

