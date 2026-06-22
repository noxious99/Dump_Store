import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
      server: {
    host: "0.0.0.0", // expose to LAN
    port: 5173,
    // Let ngrok tunnel domains through Vite's host check (otherwise the
    // tunneled URL shows "Blocked request. This host is not allowed.")
    allowedHosts: [".ngrok-free.app", ".ngrok-free.dev", ".ngrok.app", ".ngrok.io"],
  },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
