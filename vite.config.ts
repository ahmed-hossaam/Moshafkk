import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 5000,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
