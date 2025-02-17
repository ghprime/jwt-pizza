import { test, expect } from "playwright-test-coverage";
import { defaultFranchisee, defaultUser, login, testUrl } from "./testUtils";
import { Franchise, Menu } from "../src/service/pizzaService";

test.describe("franchiseDashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${testUrl}`);

    await page.route('*/**/version.json', async (route) => {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({
        body: JSON.stringify({ version: "20000101.000000" }),
      });
    });

    await page.route(`*/**/api/franchise`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify([{
          id: "1",
          name: "FranchiseeFranchise",
          admins: [{
            id: defaultFranchisee.id,
            name: defaultFranchisee.name,
            email: defaultFranchisee.email,
          }],
          stores: [{
            id: "1",
            name: "store"
          }],
        }] as Franchise[]),
      });
    });

    await page.route(`*/**/api/order/menu`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify([{
          description: "description",
          id: "1",
          image: "pizza1.png",
          price: 1,
          title: "title",
        }] as Menu),
      });
    });
  });

  test("can access the menu", async ({ page }) => {
    await page.getByRole('link', { name: 'Order' }).click();
  });

  test("can click a pizza", async ({ page }) => {
    await page.getByRole('link', { name: 'Order' }).click();

    await page.getByRole('link', { name: 'Image Description title' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 1');
  });

  test("can choose a store", async ({ page }) => {
    await page.getByRole('link', { name: 'Order' }).click();

    await page.getByRole('link', { name: 'Image Description title' }).click();
    
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeDisabled();

    await page.getByRole('combobox').selectOption('1');

    await expect(page.getByRole('button', { name: 'Checkout' })).not.toBeDisabled();
  });

  test("redirects to login for unregistered orders", async ({ page }) => {
    await page.getByRole('link', { name: 'Order' }).click();
    await page.getByRole('link', { name: 'Image Description title' }).click();
    await page.getByRole('combobox').selectOption('1');

    await page.getByRole('button', { name: 'Checkout' }).click();

    expect(page.url()).toBe(`${testUrl}/payment/login`);
  });

  test("goes to payment for registered orders", async ({ page }) => {
    await login(page);

    await page.getByRole('link', { name: 'Order' }).click();
    await page.getByRole('link', { name: 'Image Description title' }).click();
    await page.getByRole('combobox').selectOption('1');

    await page.getByRole('button', { name: 'Checkout' }).click();

    expect(page.url()).toBe(`${testUrl}/payment`);

    await expect(page.locator('tbody')).toContainText('title');
    await expect(page.locator('tfoot')).toContainText('1 pie');
    await expect(page.locator('tbody')).toContainText('1 ₿');
    await expect(page.locator('tfoot')).toContainText('1 ₿');
  });

  test("can cancel orders", async ({ page }) => {
    await login(page);

    await page.getByRole('link', { name: 'Order' }).click();
    await page.getByRole('link', { name: 'Image Description title' }).click();
    await page.getByRole('combobox').selectOption('1');

    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByRole('button', { name: 'cancel' }).click();
  });

  test("can checkout", async ({ page }) => {
    await login(page);

    await page.getByRole('link', { name: 'Order' }).click();
    await page.getByRole('link', { name: 'Image Description title' }).click();
    await page.getByRole('combobox').selectOption('1');

    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.route(`*/**/api/order`, async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({ 
        body: JSON.stringify({
          order: {
            franchiseId: "1",
            storeId: "1",
            items: [{ itemId: "1", description: "description", price: 1 }],
            id: 1,
          },
          jwt: "jwt",
        }),
      });
    });

    await page.getByRole('button', { name: 'Pay now' }).click();
    
    await expect(page.getByRole('main')).toContainText('jwt');
    await expect(page.getByRole('main')).toContainText('1 ₿');
    await expect(page.getByRole('main')).toContainText('1');
    await expect(page.getByRole('main')).toContainText('1');
  });

  test("can verify pizza - bad pizza", async ({ page }) => {
    await login(page);

    await page.getByRole('link', { name: 'Order' }).click();
    await page.getByRole('link', { name: 'Image Description title' }).click();
    await page.getByRole('combobox').selectOption('1');

    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.route(`*/**/api/order`, async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({ 
        body: JSON.stringify({
          order: {
            franchiseId: "1",
            storeId: "1",
            items: [{ itemId: "1", description: "description", price: 1 }],
            id: 1,
          },
          jwt: "jwt",
        }),
      });
    });

    await page.getByRole('button', { name: 'Pay now' }).click();
    
    await page.route(`**/api/order/verify`, async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({ 
        body: JSON.stringify({
          message: "invalid",
        }),
        status: 403,
      });
    });

    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(page.locator('pre')).toContainText('{ "error": "invalid JWT. Looks like you have a bad pizza!" }');
  });

  test("can verify pizza - good pizza", async ({ page }) => {
    await login(page);

    await page.getByRole('link', { name: 'Order' }).click();
    await page.getByRole('link', { name: 'Image Description title' }).click();
    await page.getByRole('combobox').selectOption('1');

    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.route(`*/**/api/order`, async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({ 
        body: JSON.stringify({
          order: {
            franchiseId: "1",
            storeId: "1",
            items: [{ itemId: "1", description: "description", price: 1 }],
            id: 1,
          },
          jwt: "jwt",
        }),
      });
    });

    await page.getByRole('button', { name: 'Pay now' }).click();
    
    await page.route(`**/api/order/verify`, async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({ 
        body: JSON.stringify({
          message: "valid",
          payload: "jwt"
        }),
      });
    });

    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(page.locator('pre')).toContainText('jwt');
  });
});
