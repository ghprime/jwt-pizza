import { test, expect } from "playwright-test-coverage";
import { login, testUrl } from "./testUtils";

test.describe("logout page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
  });

  test("logs in user", async ({ page }) => {
    await login(page);

    await page.route('*/**/api/auth', async (route) => {
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({
        body: JSON.stringify({ message: "logout successful" }),
      });
    });

    await page.goto(`${testUrl}/logout`);

    await expect(page.locator('#navbar-dark')).toContainText('Login');
  });

  test("can't logout if not logged in", async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({
        body: JSON.stringify({ message: "unauthorized" }),
        status: 401,
      });
    });

    await page.goto(`${testUrl}/logout`);
    
    await expect(page.getByRole('heading')).toContainText('Logout');
  });
});
