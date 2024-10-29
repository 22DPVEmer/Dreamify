import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    headers: {
      "Content-Security-Policy": [
        "default-src 'none'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "img-src 'self' data: blob:",
        "font-src 'self' https://cdn.jsdelivr.net",
        "connect-src 'self' http://localhost:8081",
        "manifest-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "media-src 'none'",
        "object-src 'none'",
        "worker-src 'none'",
        "frame-ancestors 'none'",
      ].join("; "),
    },
  },
});
