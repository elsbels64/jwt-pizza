import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

test('login admin and open admin page', async ({ page }) => {
  //login admin
  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page.locator('tbody')).toContainText('pizzaPocket');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  
  //go to admin page
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.locator('h3')).toContainText('Franchises');
  
  //add a franchise
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('New Franchise');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('d@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('table')).toContainText('New Franchise');

  //filter franchises
  await page.getByRole('textbox', { name: 'Filter franchises' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('pizzaPocket');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('tbody')).toContainText('pizzaPocket');
  await page.getByRole('textbox', { name: 'Filter franchises' }).dblclick();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('');
  await page.getByRole('button', { name: 'Submit' }).click();

  //delete a franchise
  await expect(page.getByRole('table')).toContainText('New Franchise');
  await page.getByRole('row', { name: 'New Franchise pizza diner' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('tbody')).toContainText('pizzaPocket');
});