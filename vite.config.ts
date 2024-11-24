import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL),
      'process.env.REACT_APP_CLIENT_URL': JSON.stringify(env.REACT_APP_CLIENT_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime'),
        'buffer': 'buffer',
        'crypto': 'crypto-browserify'
      }
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
          }
        }
      }
    },
    server: {
      port: 3000,
      proxy: {
        '/auth': `${process.env.REACT_APP_API_URL}`,
        '/callback': `${process.env.REACT_APP_API_URL}`,
      },
    }
  };
});
