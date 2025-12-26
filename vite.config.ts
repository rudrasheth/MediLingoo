import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "./frontend"),
  server: {
    // Bind explicitly to localhost IPv4 to avoid IPv6 (::) issues on Windows
    host: "localhost",
    port: 5173,
    // Allow Vite to fall back to the next free port if 5173 is busy
    strictPort: false,
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
  preview: {
    host: "localhost",
    port: 5173,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/src"),
    },
  },
}));
