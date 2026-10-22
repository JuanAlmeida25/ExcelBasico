import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // rutas relativas para que el build abra hasta desde una USB
  base: './'
})
