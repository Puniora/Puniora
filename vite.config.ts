import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/shiprocket': {
        target: 'https://apiv2.shiprocket.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/shiprocket/, ''),
        secure: false,
      },
      '/api/whatsapp': {
          target: 'https://graph.facebook.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/whatsapp/, ''),
          secure: true,
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
      output: {
        // Let Vite handle chunk splitting automatically
      },
    chunkSizeWarningLimit: 1000,
  },
}));
