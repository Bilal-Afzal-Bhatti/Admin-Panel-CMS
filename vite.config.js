import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // This splits your third-party node_modules packages into a separate file
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // Optional: Slightly raise the limit to 1000kB (1MB) if you still get minor warnings
    chunkSizeWarningLimit: 1000, 
  }
})