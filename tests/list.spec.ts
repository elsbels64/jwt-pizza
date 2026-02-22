import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';




test('login admin and open admin page and add franchise', async ({ page }) => {
  await page.goto('/');
    //login admin
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  //go to admin page
  await page.getByRole('link', { name: 'Admin' }).click();

});