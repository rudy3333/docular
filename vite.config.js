import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': 'http://localhost:8000',
      '/signup': 'http://localhost:8000',
      '/upload_pdf': 'http://localhost:8000',
      '/list_pdfs': 'http://localhost:8000',
      '/pdf_summary': 'http://localhost:8000',
      '/delete_pdf': 'http://localhost:8000',
    }
  }
})
