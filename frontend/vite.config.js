import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    // This is critical for local development — it's a proxy
    // When React code calls "/api/tasks", Vite forwards it to
    // the gateway at localhost:3000 instead of trying to find
    // it on the frontend's own server
    // Without this, your browser would get CORS errors locally
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});