import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const chunkGroups = [
  {
    name: "react",
    packages: ["react", "react-dom"],
  },
  {
    name: "tanstack-router",
    packages: ["@tanstack/react-router"],
  },
  {
    name: "tanstack-query",
    packages: ["@tanstack/react-query"],
  },
  {
    name: "tanstack-table",
    packages: ["@tanstack/react-table"],
  },
  {
    name: "radix",
    packages: [
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },
  {
    name: "icons",
    packages: ["lucide-react", "react-icons"],
  },
  {
    name: "forms",
    packages: ["react-hook-form", "@hookform/resolvers", "zod"],
  },
]

const manualChunks = (id: string) => {
  if (!id.includes("node_modules")) {
    return undefined
  }

  const matchedGroup = chunkGroups.find((group) =>
    group.packages.some((pkg) => id.includes(`/node_modules/${pkg}/`)),
  )

  return matchedGroup?.name
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
