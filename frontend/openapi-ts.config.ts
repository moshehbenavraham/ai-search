import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "./openapi.json",
  output: {
    entryFile: false,
    path: "./src/client-generated",
  },

  plugins: [
    "@hey-api/client-axios",
    {
      name: "@hey-api/sdk",
      client: "@hey-api/client-axios",
    },
    {
      name: "@hey-api/schemas",
      type: "json",
    },
  ],
})
