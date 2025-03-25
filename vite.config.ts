import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    open: true, // 🔹 Abre automáticamente en el navegador
  },
  build: {
    outDir: "dist",
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 🔹 Configuración para que React Router maneje las rutas
  esbuild: {
    define: {
      "process.env.NODE_ENV": `"${mode}"`,
    },
  },
}));

