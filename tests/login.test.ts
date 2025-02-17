import { test, expect } from "playwright-test-coverage";
import { defaultAdmin, defaultUser, testUrl } from "./testUtils";

test.describe("login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
  });

  test("exists", async ({ page }) => {
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.getByRole('heading')).toContainText('Welcome back');
  });

  test("doesn't log in non-existant user", async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      expect(route.request().method()).toBe('PUT');
      await route.fulfill({ body: JSON.stringify({ code: 404, message: "unknown user" }), status: 404 });
    });
    
    await page.getByRole('link', { name: 'Login' }).click();

    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('unknown@email.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');
    await expect(page.getByRole('main')).toContainText('{"code":404,"message":"unknown user"}');
  });

  test("logs in user", async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      expect(route.request().method()).toBe('PUT');
      await route.fulfill({ 
        body: JSON.stringify({ 
          user: defaultUser,
          token: "token",
        }), 
      });
    });

    await page.getByRole('link', { name: 'Login' }).click();

    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('unknown@email.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');

    await expect(page.locator('#navbar-dark')).toContainText('Logout');
  });

  test("logs in admin", async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      expect(route.request().method()).toBe('PUT');
      await route.fulfill({ 
        body: JSON.stringify({ 
          user: defaultAdmin,
          token: "token",
        }), 
      });
    });

    await page.getByRole('link', { name: 'Login' }).click();

    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('email@email.com');
    await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('textbox', { name: 'Password' }).press('Enter');

    await expect(page.locator('#navbar-dark')).toContainText('Admin');
  });
});
