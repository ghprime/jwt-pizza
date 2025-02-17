import { test, expect } from "playwright-test-coverage";
import { testUrl } from "./testUtils";

test.describe("about page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
  });

  test("exists", async ({ page }) => {
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('main')).toContainText('The secret sauce');
  });
});
