import { expect, test } from "@playwright/test"

test.use({ storageState: { cookies: [], origins: [] } })

test("router devtools opens and survives client-side navigation", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  // This smoke test must not depend on a backend or call external APIs.
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url())
    if (
      url.pathname.startsWith("/api/v1/") ||
      url.origin !== new URL(test.info().project.use.baseURL!).origin
    ) {
      return route.abort()
    }
    return route.continue()
  })
  await page.goto("/login")
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible()
  await page
    .getByRole("button", { name: /open tanstack router devtools/i })
    .click()
  await expect(page.getByText("TanStack Router", { exact: true })).toBeVisible()
  await page.getByRole("link", { name: "Create account" }).click()
  await expect(page).toHaveURL(/\/signup$/)
  await page.goBack()
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible()
  expect(errors).toEqual([])
})
