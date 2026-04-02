import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../../src/service/pizzaService';

async function basicInit(page: Page) {
  await page.goto('/');
}


test("Franchisee can login and view their franchises and stores", async ({ page }) => {
    await basicInit(page);
    // login franchisee    
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('#navbar-dark')).toContainText('Franchise');

    // view franchises and stores
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('main')).toContainText('Everything you need to run an JWT Pizza franchise. Your gateway to success.');
    await page.getByText('pizzaPocket').click();


    // create new store
    await page.getByRole('button', { name: 'Create store' }).click();
    await page.getByRole('textbox', { name: 'store name' }).click();
    await page.getByRole('textbox', { name: 'store name' }).fill('new store');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.locator('tbody')).toContainText('new store');

    // // close store
    await page.getByRole('row', { name: 'new store 0 ₿ Close' }).getByRole('button').click();
    await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
    await expect(page.getByRole('main')).toContainText('pizzaPocket');
    await expect(page.getByRole('main')).toContainText('new store');
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('tbody')).toContainText('SLC');
});

// test.describe('Franchisee dashboard', () => {


//     test('Franchisee can view their franchises and stores', async ({ page }) => {
//         await basicInit(page);

