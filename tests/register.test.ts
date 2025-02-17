import { test, expect } from "playwright-test-coverage";
import { defaultUser, testUrl } from "./testUtils";

test.describe("register page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
  });

  test("registers a user", async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({ 
        body: JSON.stringify({ 
          user: defaultUser,
          token: "token",
        }), 
      });
    });
    
    await page.getByRole('link', { name: 'Register' }).click();

    await page.getByRole('textbox', { name: 'Full name' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('User');
    await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
    await page.getByRole('textbox', { name: 'Email address' }).fill('user@email.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.locator('#navbar-dark')).toContainText('Logout');
  });

  test("displays an error", async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({ 
        body: JSON.stringify({ 
          message: "name, email, and password are required",
        }), 
        status: 400,
      });
    });
    
    await page.getByRole('link', { name: 'Register' }).click();

    await page.getByRole('textbox', { name: 'Full name' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('User');
    await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
    await page.getByRole('textbox', { name: 'Email address' }).fill('user@email.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('main')).toContainText('{"code":400,"message":"name, email, and password are required"}');
  });
});
