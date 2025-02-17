import { test, expect } from "playwright-test-coverage";
import { defaultAdmin, login, testUrl } from "./testUtils";
import { Franchise } from "../src/service/pizzaService";
import { Page } from "@playwright/test";

test.describe("admin dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
  });

  const adminPage = async (page: Page) => {
    const admin = await login(page, defaultAdmin);
    await page.route('*/**/version.json', async (route) => {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({
        body: JSON.stringify({ version: "20000101.000000" }),
      });
    });
    
    await page.route('*/**/api/franchise', async (route) => {
      expect(route.request().method()).toBe('GET');
      await route.fulfill({
        body: JSON.stringify([{ 
          id: "1", 
          name: "franchise", 
          stores: [{ name: "store", id: "1", totalRevenue: 1 }],
          admins: [{ email: defaultAdmin.email, id: defaultAdmin.id, name: defaultAdmin.name }],
        }] as Franchise[]),
      });
    });

    await page.getByRole('link', { name: "Admin" }).click();
    
    return admin;
  }

  test("can access adminDashboard", async ({ page }) => {
    await adminPage(page);
    
    await expect(page.getByRole('cell', { name: 'franchise' })).toContainText('franchise');
    await expect(page.getByRole('cell', { name: 'store' })).toContainText('store');
    await expect(page.getByRole('cell', { name: '₿' })).toContainText('1 ₿');
  });

  test.describe("close franchise", () => {
    test("asks for confirmation", async ({ page }) => {
      await adminPage(page);
      
      await page.getByRole('row', { name: 'franchise admin Close' }).getByRole('button').click();
  
      await expect(page.getByText('Sorry to see you go')).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(page.getByRole('cell', { name: 'franchise' })).toContainText('franchise');
    })

    test("can close franchise", async ({ page }) => {
      await adminPage(page);
      
      await page.getByRole('row', { name: 'franchise admin Close' }).getByRole('button').click();
      
      await expect(page.getByText('Sorry to see you go')).toBeVisible();
    
      let deleted = false;

      await page.route('*/**/api/franchise/1', async (route) => {
        expect(route.request().method()).toBe('DELETE');

        deleted = true;

        await route.fulfill({
          body: JSON.stringify({ message: "franchise deleted" }),
        });
      });
  
      await page.route('*/**/api/franchise', async (route) => {
        expect(route.request().method()).toBe('GET');
        await route.fulfill({
          body: JSON.stringify([] as Franchise[]),
        });
      });

      await page.getByRole('button', { name: 'Close' }).click();

      await expect(page.locator('button', { hasText: 'Close' })).not.toBeAttached();
      expect(deleted).toBe(true);
    });
  });
  
  test.describe("close store", () => {
    test("asks for confirmation", async ({ page }) => {
      await adminPage(page);
      
      await page.getByRole('row', { name: 'store 1 ₿ Close' }).getByRole('button').click();
  
      await expect(page.getByText('Sorry to see you go')).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(page.getByRole('cell', { name: 'store' })).toContainText('store');
    })

    test("can close store", async ({ page }) => {
      await adminPage(page);
      
      await page.getByRole('row', { name: 'store 1 ₿ Close' }).getByRole('button').click();
      
      await expect(page.getByText('Sorry to see you go')).toBeVisible();

      let deleted = false;
    
      await page.route('*/**/api/franchise/1/store/1', async (route) => {
        expect(route.request().method()).toBe('DELETE');
        deleted = true;

        await route.fulfill({
          body: JSON.stringify({ message: "store deleted" }),
        });
      });
  
      await page.route('*/**/api/franchise', async (route) => {
        expect(route.request().method()).toBe('GET');
        await route.fulfill({
          body: JSON.stringify([{ 
            id: "1", 
            name: "franchise", 
            stores: [],
            admins: [{ email: defaultAdmin.email, id: defaultAdmin.id, name: defaultAdmin.name }],
          }] as Franchise[]),
        });
      });

      await page.getByRole('button', { name: 'Close' }).click();

      await expect(page.getByRole('button', { name: 'Close' })).toBeAttached();

      expect(deleted).toBe(true);
    });
  });

  test.describe("create franchise", () => {
    test("can create franchise", async ({ page }) => {
      const admin = await adminPage(page);

      await page.getByRole('button', { name: 'Add Franchise' }).click();

      await page.getByRole('textbox', { name: 'franchise name' }).click();
      await page.getByRole('textbox', { name: 'franchise name' }).fill('franchise1');
      await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
      await page.getByRole('textbox', { name: 'franchisee admin email' }).fill(admin.email);

      let created = false;
  
      await page.route('*/**/api/franchise', async (route) => {
        if (route.request().method() === 'POST') {
          created = true;

          await route.fulfill({
            body: JSON.stringify([{ 
              id: "2", 
              name: "franchise1", 
              stores: [],
              admins: [{ email: defaultAdmin.email, id: defaultAdmin.id, name: defaultAdmin.name }],
            }] as Franchise[]),
          });
        } else if (route.request().method() === 'GET') {
          expect(created).toBe(true);

          await route.fulfill({
            body: JSON.stringify([
            { 
              id: "1", 
              name: "franchise", 
              stores: [{ name: "store", id: "1", totalRevenue: 1 }],
              admins: [{ email: defaultAdmin.email, id: defaultAdmin.id, name: defaultAdmin.name }],
            },
            { 
              id: "2", 
              name: "franchise1", 
              stores: [],
              admins: [{ email: defaultAdmin.email, id: defaultAdmin.id, name: defaultAdmin.name }],
            }
          ] as Franchise[]),
          });
        }
      });

      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByRole('row', { name: 'franchise1 admin Close' })).toBeAttached();
      expect(created).toBe(true);
    });
  });
});
