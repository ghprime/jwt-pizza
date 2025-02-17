import { Page } from "@playwright/test";
import { Role, User } from "../src/service/pizzaService";
import { expect } from "playwright-test-coverage";

export const defaultUser: User = { 
  id: "1", 
  name: "user", 
  email: "user@email.com", 
  password: "password", 
  roles: [{ role: Role.Diner }],
};

export const defaultAdmin: User = { 
  id: "2", 
  name: "admin", 
  email: "admin@email.com", 
  password: "password", 
  roles: [{ role: Role.Admin }],
};

export const defaultFranchisee: User = { 
  id: "3", 
  name: "franchisee", 
  email: "franchisee@email.com", 
  password: "password", 
  roles: [{ role: Role.Franchisee, objectId: "1" }],
};

export const testUrl = "http://localhost:5173"

export const login = async (page: Page, user: User = defaultUser) => {
  let loggedIn = false;
  await page.route('*/**/api/auth', async (route) => {
    if (loggedIn || route.request().method() !== 'PUT') {
      await route.fallback();
      return;
    }

    loggedIn = true;
    
    await route.fulfill({ 
      body: JSON.stringify({ 
        user,
        token: "token",
      }), 
    });
  });

  await page.goto(testUrl);
  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('email@email.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  
  await expect(page.locator('#navbar-dark')).toContainText('Logout');

  return user;
}
