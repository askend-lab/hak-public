import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

function getGitInfo(): { commitHash: string; commitMessage: string; branch: string; commitDate: string } {
  try {
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const commitMessage = execSync('git log -1 --format=%s').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const commitDate = execSync('git log -1 --format=%ci').toString().trim();
    return { commitHash, commitMessage, branch, commitDate };
  } catch {
    return { commitHash: 'unknown', commitMessage: '', branch: 'unknown', commitDate: '' };
  }
}

const gitInfo = getGitInfo();

export default defineConfig({
  define: {
    __BUILD_INFO__: JSON.stringify({
      commitHash: gitInfo.commitHash,
      commitMessage: gitInfo.commitMessage,
      branch: gitInfo.branch,
      commitDate: gitInfo.commitDate,
      buildTime: new Date().toISOString(),
      workingDir: process.cwd(),
    }),
  },
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
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5181,
    strictPort: true,
    proxy: {
      '/api/vabamorf': {
        target: 'https://vabamorf-dev.askend-lab.com',
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
        target: 'https://merlin-prod.askend-lab.com',
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
      '/api/analyze': {
        target: 'https://vabamorf-dev.askend-lab.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('Cookie');
          });
        },
      },
      '/api/variants': {
        target: 'https://vabamorf-dev.askend-lab.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('Cookie');
          });
        },
      },
      '/api/synthesize': {
        target: 'https://merlin-prod.askend-lab.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('Cookie');
          });
        },
      },
      '/api/status': {
        target: 'https://merlin-prod.askend-lab.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
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
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
            proxyReq.removeHeader('Cookie');
          });
        },
      },
    },
  },
})
