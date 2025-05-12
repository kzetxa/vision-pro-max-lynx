import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly', // Use camelCase for imported class names (e.g., styles.myClass)
      // Optional: Configure generated scope name (useful for debugging)
      // generateScopedName: '[name]__[local]___[hash:base64:5]', 
    }
  }
}) 