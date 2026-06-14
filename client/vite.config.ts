import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@shared": fileURLToPath(new URL("../shared", import.meta.url)),
    },
    // The shared contract lives outside client/, so force these bare imports
    // to resolve from the client's node_modules.
    dedupe: ["zod", "react", "react-dom"],
  },
  server: {
    port: 5173,
    // Allow importing the shared contract that lives outside the client root.
    fs: { allow: [".."] },
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.API_PORT ?? 5678}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["motion"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
});
