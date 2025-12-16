import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api/vabamorf': {
        target: 'https://ibgaeez4mm.eu-west-1.awsapprunner.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vabamorf/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('Cookie');
          });
        },
      },
      '/api/merlin': {
        target: 'https://swq24fqfiu.eu-west-1.awsapprunner.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/merlin/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('Cookie');
          });
        },
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/dev'),
      },
    },
  },
})
