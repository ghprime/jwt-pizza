import { test, expect } from "playwright-test-coverage";
import { defaultFranchisee, defaultUser, login, testUrl } from "./testUtils";
import { Franchise } from "../src/service/pizzaService";

test.describe("franchiseDashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
  });

  test("invites to be a franchisee", async ({ page }) => {
    const franchisee = await login(page, defaultUser);

    let called = false;

    await page.route(`*/**/api/franchise/${franchisee.id}`, async (route) => {
      expect(route.request().method()).toBe('GET');

      called = true;

      await route.fulfill({ 
        body: JSON.stringify([]),
      });
    });

    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

    await expect(page.getByText('So you want a piece of the')).toBeAttached();
    expect(called).toBe(true);
  });

  test("has user franchises", async ({ page }) => {
    const franchisee = await login(page, defaultFranchisee);

    await page.route(`*/**/api/franchise/${franchisee.id}`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify([{
          id: 1,
          name: "FranchiseeFranchise",
          admins: [{
            id: franchisee.id,
            name: franchisee.name,
            email: franchisee.email,
          }],
          stores: [],
        }]),
      });
    });

    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

    await expect(page.getByRole('main')).toContainText("FranchiseeFranchise");
  });
  
  test("shows stores", async ({ page }) => {
    const franchisee = await login(page, defaultFranchisee);

    await page.route(`*/**/api/franchise/${franchisee.id}`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify([{
          id: "1",
          name: "FranchiseeFranchise",
          admins: [{
            id: franchisee.id,
            name: franchisee.name,
            email: franchisee.email,
          }],
          stores: [{ id: "1", name: "store", totalRevenue: 1 }],
        }] as Franchise[]),
      });
    });

    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();

    await expect(page.getByRole('cell', { name: 'store' })).toBeAttached();
  });

  test("can close a store", async ({ page }) => {
    const franchisee = await login(page, defaultFranchisee);

    await page.route(`*/**/api/franchise/${franchisee.id}`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify([{
          id: "1",
          name: "FranchiseeFranchise",
          admins: [{
            id: franchisee.id,
            name: franchisee.name,
            email: franchisee.email,
          }],
          stores: [{ id: "1", name: "store", totalRevenue: 1 }],
        }] as Franchise[]),
      });
    });

    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    
    await page.getByRole('button', { name: 'Close' }).click();

    await page.route(`*/**/api/franchise/${franchisee.id}/store/1`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify({ message: "store deleted "}),
      });
    });

    await page.route(`*/**/api/franchise/${franchisee.id}`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify([{
          id: "1",
          name: "FranchiseeFranchise",
          admins: [{
            id: franchisee.id,
            name: franchisee.name,
            email: franchisee.email,
          }],
          stores: [],
        }] as Franchise[]),
      });
    });

    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByRole('cell', { name: 'store' })).not.toBeAttached();
  });

  test("creates a store", async ({ page }) => {
    const franchisee = await login(page, defaultFranchisee);

    await page.route(`*/**/api/franchise/${franchisee.id}`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify([{
          id: "1",
          name: "FranchiseeFranchise",
          admins: [{
            id: franchisee.id,
            name: franchisee.name,
            email: franchisee.email,
          }],
          stores: [],
        }] as Franchise[]),
      });
    });

    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    
    await expect(page.getByRole('cell', { name: 'store' })).not.toBeAttached();

    await page.getByRole('button', { name: 'Create store' }).click();

    await page.getByRole('textbox', { name: 'store name' }).click();

    const storeName = 'store';

    await page.getByRole('textbox', { name: 'store name' }).fill(storeName);

    await page.route(`*/**/api/franchise/${franchisee.roles[0].objectId}/store`, async (route) => {
      expect(route.request().method()).toBe('POST');

      await route.fulfill({ 
        body: JSON.stringify({
          id: 1,
          franchiseId: franchisee.roles[0].objectId,
          name: storeName,
        }),
      });
    });

    await page.route(`*/**/api/franchise/${franchisee.id}`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify([{
          id: "1",
          name: "FranchiseeFranchise",
          admins: [{
            id: franchisee.id,
            name: franchisee.name,
            email: franchisee.email,
          }],
          stores: [{ id: "1", name: storeName, totalRevenue: 0 }],
        }] as Franchise[]),
      });
    });

    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('cell', { name: 'store' })).toBeAttached();
  });
});
