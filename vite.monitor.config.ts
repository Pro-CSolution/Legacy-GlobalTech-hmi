import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  root: resolve(__dirname, 'monitor-web'),
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  },
  server: {
    host: '0.0.0.0',
    fs: {
      allow: [resolve(__dirname)]
    }
  },
  preview: {
    host: '0.0.0.0'
  },
  build: {
    outDir: resolve(__dirname, 'dist-monitor'),
    emptyOutDir: true
  }
})
