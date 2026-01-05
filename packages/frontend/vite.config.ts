import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "${path.resolve(__dirname, '../vendor/eki-storybook/src/stories/assets/scss/abstracts/variables')}" as *;
          $color-light-blue: #e3effb;
          $border-radius-round: 50px;
        `,
        loadPaths: [path.resolve(__dirname, '..')],
        silenceDeprecations: ['import'],
      },
    },
  },
  resolve: {
    alias: {
      '@hak/specifications': path.resolve(__dirname, '../specifications/index.ts'),
      '@hak/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
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
      '/api/audio': {
        target: 'https://3ktlnibu21.execute-api.eu-west-1.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/audio/, '/dev'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('Cookie');
          });
        },
      },
      '/api': {
        // Local development: use local serverless-offline
        // target: 'http://localhost:4000',
        // rewrite: (path) => path.replace(/^\/api/, '/dev'),
        
        // Deployed API: use hak-api-dev.askend-lab.com
        target: 'https://hak-api-dev.askend-lab.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
