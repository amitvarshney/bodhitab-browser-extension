import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { UserConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Clean up file names by removing hashes
        entryFileNames: 'js/[name].js',
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId || '';
          if (facadeModuleId.includes('node_modules')) {
            return 'js/vendor/[name].js';
          }
          return 'js/[name].js';
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name][extname]';
          const extType = assetInfo.name.split('.')[1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'icons/[name][extname]';
          }
          if (/css/i.test(extType)) {
            return 'css/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion']
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
  esbuild: {
    pure: ['console.log', 'console.debug', 'console.info'],
    treeShaking: true,
  },
} as UserConfig)