import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const THREE_CDN_BASE = 'https://cdn.jsdelivr.net/npm/three@0.186.0'

export default defineConfig({
  plugins: [
    {
      name: 'three-cdn-resolver',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'three') {
          return { id: `${THREE_CDN_BASE}/build/three.module.js`, external: true }
        }
        if (id.startsWith('three/addons/')) {
          const subpath = id.slice('three/addons/'.length)
          return { id: `${THREE_CDN_BASE}/examples/jsm/${subpath}`, external: true }
        }
        return null
      },
    },
    react(),
    tailwindcss(),
  ],
  css: {
    devSourcemap: false,
  },
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 800,
  },
})
