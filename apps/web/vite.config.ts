import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import path from "node:path"

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar Three.js em chunk próprio (carrega só quando necessário)
          "three-vendor": ["three", "three-globe", "@react-three/fiber", "@react-three/drei"],
          // React core
          "react-vendor": ["react", "react-dom"],
          // TanStack
          "tanstack-vendor": ["@tanstack/react-router", "@tanstack/react-query"],
        },
      },
    },
  },
})
