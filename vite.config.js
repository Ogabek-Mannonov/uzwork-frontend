import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Define proxy options to intercept API calls but allow frontend page loads
const apiProxy = { 
  target: 'http://localhost:3000', 
  changeOrigin: true,
  bypass: (req, res, options) => {
    // If the browser asks for an HTML page (e.g. typing URL and hitting enter), bypass the proxy
    if (req.headers.accept?.includes('text/html')) {
      return '/index.html';
    }
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth':          apiProxy,
      '/projects':      apiProxy,
      '/proposals':     apiProxy,
      '/contracts':     apiProxy,
      '/reviews':       apiProxy,
      '/profiles':      apiProxy,
      '/freelancers':   apiProxy,
      '/clients':       apiProxy,
      '/search':        apiProxy,
      '/notifications': apiProxy,
      '/messages':      apiProxy,
      '/payments':      apiProxy,
      '/marketplace':   apiProxy,
      '/admin':         apiProxy,
      '/ai':            apiProxy,
      '/support':       apiProxy,
      '/currencies':    apiProxy,
      '/files':         apiProxy,
      '/upload':        apiProxy,
      '/uploads':       apiProxy,
      '/disputes':      apiProxy,
      '/milestones':    apiProxy,
      '/api':           apiProxy,
      '/socket.io':     { target: 'http://localhost:3000', changeOrigin: true, ws: true },
    },
  },
})