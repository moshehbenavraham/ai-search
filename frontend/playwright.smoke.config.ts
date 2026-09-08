import { defineConfig, devices } from "@playwright/test"

// Backend-free regression coverage for the development-only router tools.
export default defineConfig({
  testDir: "./tests",
  testMatch: "router-devtools.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:5189",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5189",
    url: "http://127.0.0.1:5189",
    reuseExistingServer: false,
  },
})
