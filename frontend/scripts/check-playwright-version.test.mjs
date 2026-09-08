import assert from "node:assert/strict"
import { test } from "node:test"
import { checkPlaywrightVersion } from "./check-playwright-version.mjs"

const version = "1.62.1"
const manifest = { devDependencies: { "@playwright/test": version } }
const lock = {
  packages: Object.fromEntries(
    ["@playwright/test", "playwright", "playwright-core"].map((name) => [
      `node_modules/${name}`,
      { version },
    ]),
  ),
}
const dockerfile = `FROM mcr.microsoft.com/playwright:v${version}-noble\n`

test("accepts matching exact versions", () => {
  assert.doesNotThrow(() => checkPlaywrightVersion(manifest, lock, dockerfile))
})

test("rejects the original Docker-only upgrade", () => {
  const oldManifest = { devDependencies: { "@playwright/test": "^1.60.0" } }
  assert.throws(() => checkPlaywrightVersion(oldManifest, lock, dockerfile))
})

for (const name of ["@playwright/test", "playwright", "playwright-core"]) {
  test(`rejects stale ${name} in the lockfile`, () => {
    const staleLock = structuredClone(lock)
    staleLock.packages[`node_modules/${name}`].version = "1.60.0"
    assert.throws(() => checkPlaywrightVersion(manifest, staleLock, dockerfile))
  })
}

test("rejects a missing image version", () => {
  assert.throws(() => checkPlaywrightVersion(manifest, lock, "FROM node:24"))
})
