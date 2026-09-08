import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

export function checkPlaywrightVersion(manifest, lock, dockerfile) {
  const version = dockerfile.match(
    /^FROM mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-/m,
  )?.[1]
  assert.ok(
    version,
    "Dockerfile.playwright must pin a Playwright image version",
  )
  assert.equal(
    manifest.devDependencies["@playwright/test"],
    version,
    "Pin @playwright/test to the Docker image version",
  )
  for (const name of ["@playwright/test", "playwright", "playwright-core"]) {
    assert.equal(
      lock.packages[`node_modules/${name}`]?.version,
      version,
      `Regenerate package-lock.json: ${name} must match the Docker image`,
    )
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const read = (name) =>
    readFileSync(new URL(`../${name}`, import.meta.url), "utf8")
  checkPlaywrightVersion(
    JSON.parse(read("package.json")),
    JSON.parse(read("package-lock.json")),
    read("Dockerfile.playwright"),
  )
  console.log("Playwright package, lockfile, and Docker image versions match")
}
