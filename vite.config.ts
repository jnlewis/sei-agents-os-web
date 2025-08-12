import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/template': {
        target: 'https://npnc7aykeee5uueftrgnupxkiu0vjahx.lambda-url.us-east-1.on.aws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/template/, ''),
        headers: {
          'seiagents-api-key': 'demoApiKey'
        }
      },
      '/api/stream': {
        target: 'https://q2jgpxpl7y7tvn7nkfem5ro7hy0uigkb.lambda-url.us-east-1.on.aws',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stream/, ''),
        headers: {
          'seiagents-api-key': 'demoApiKey'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
