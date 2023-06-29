import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  publicPath: process.env.NODE_ENV === "production" ? "https://devravimori.github.io/expense-tracker/" : "/",  
})
