import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    watch: {
      // a API (Node) mora dentro do projeto e regrava o data/database.json a cada POST/PUT/DELETE;
      // sem isto o Vite recarrega a pagina inteira a cada alteracao feita pela interface
      ignored: ['**/api/**'],
    },
  },
})
