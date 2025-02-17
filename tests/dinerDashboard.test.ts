import { test, expect } from "playwright-test-coverage";
import { defaultAdmin, defaultFranchisee, defaultUser, login, testUrl } from "./testUtils";
import { Order } from "../src/service/pizzaService";

test.describe("diner dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
  });

  [
    defaultUser,
    defaultAdmin,
    defaultFranchisee,
  ].forEach(user => {
    test(`displays ${user.name}'s info`, async ({ page }) => {
      await login(page, user);

      await page.route('*/**/api/order', async (route) => {
        expect(route.request().method()).toBe('GET');

        await route.fulfill({ 
          body: JSON.stringify({ 
            dinerId: +user.id,
            orders: [],
            page: 1,
          }),
        });
      });
  
      await page.getByRole('link', { name: user.name[0], exact: true }).click();
      await expect(page.getByRole('main')).toContainText(user.name);
      await expect(page.getByRole('main')).toContainText(user.email);
      await expect(page.getByRole('main')).toContainText(user.roles[0].role);
    });
  });

  test("doesn't display anything for logged out user", async ({ page }) => {
    await page.goto(`${testUrl}/diner-dashboard`);
    
    await expect(page.getByRole('heading')).toContainText('Oops');
  });

  test("displays a users orders", async ({ page }) => {
    const user = await login(page);

    await page.route('*/**/api/order', async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify({ 
          dinerId: +user.id,
          orders: [{
            id: "1",
            date: new Date().toLocaleDateString(),
            franchiseId: "1",
            items: [{
              description: "description",
              menuId: "1",
              price: 1,
            }],
            storeId: "1",
          }] as Order[],
          page: 1,
        }),
      });
    });

    await page.getByRole('link', { name: user.name[0], exact: true }).click();
    await expect(page.getByRole('cell', { name: '₿' })).toContainText("1");
  });
});
