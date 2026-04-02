import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../../src/service/pizzaService';

async function basicInit(page: Page) {
  await page.goto('/');
}

test('delete user from admin page', async ({ page }) => {
  await basicInit(page);
  // add new user to delete later
 // login admin
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
 
  await expect(page.getByRole('main')).toContainText('Users');
  await expect(page.getByRole('main')).toContainText('常用名字');
  await expect(page.getByRole('main')).toContainText('new user');

  await page.locator('tr', { hasText: 'new user' }).getByRole('button').click();
  await expect(page.getByRole('main')).toContainText('常用名字');
  
  await expect(page.getByRole('main')).not.toContainText('new user')

});

test('click next user page', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('main')).toContainText('常用名字');
    await page.getByRole('button', { name: '»' }).nth(1).click();
    await expect(page.getByRole('main')).not.toContainText('常用名字');
});

test('filter user by name', async ({ page }) => {
  await basicInit(page);

  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();

  
  await expect(page.getByRole('main')).toContainText('常用名字');
  await expect(page.getByRole('main')).toContainText('pizza diner');
  await expect(page.getByRole('main')).toContainText('pizza franchisee');

  await page.getByRole('textbox', { name: 'Name' }).fill('常用名字');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('main')).toContainText('常用名字');
  await expect(page.getByRole('main')).not.toContainText('pizza diner');
  await page.getByRole('textbox', { name: 'Name' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('main')).toContainText('常用名字');
  await expect(page.getByRole('main')).toContainText('pizza diner');
  await expect(page.getByRole('main')).toContainText('pizza franchisee');
});

  

test('login admin and open admin page and add franchise', async ({ page }) => {
  test.setTimeout(30000);
  await basicInit(page);
  //login admin
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  //go to admin page
  await page.getByRole('link', { name: 'Admin' }).click();
 // await expect(page.locator('h3')).toContainText('Franchises');

  //add a franchise
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('New Franchise');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByRole('main')).toContainText('New Franchise');


  // //filter franchises
  await page.getByRole('textbox', { name: 'Filter franchises' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('pizzaPocket');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('main')).toContainText('pizzaPocket');
  await expect(page.getByRole('main')).not.toContainText('New Franchise');
  await page.getByRole('textbox', { name: 'Filter franchises' }).dblclick();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('main')).toContainText('New Franchise');
  await expect(page.getByRole('main')).toContainText('pizzaPocket');
  // //delete a franchise
  await page.getByRole('row', { name: 'New Franchise pizza' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await expect(page.getByRole('main')).toContainText('New Franchise');
  await page.waitForURL('**/close-franchise'); 
  await page.getByRole('button', { name: 'Close' }).click();
   await page.waitForURL('**/admin-dashboard'); 
  await expect(page.getByRole('main')).toContainText('pizzaPocket');

  await page.getByRole('row', { name: 'SLC 0 ₿ Close' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await expect(page.getByRole('main')).toContainText('pizzaPocket');
  await expect(page.getByRole('main')).toContainText('SLC');
  await page.getByRole('button', { name: 'Close' }).click();
  const franchiseTable = page.locator('table', { 
  has: page.getByRole('columnheader', { name: 'Franchisee' }) 
});
await expect(franchiseTable.locator('tbody')).not.toContainText('SLC');

  await expect(page.getByRole('main')).not.toContainText('New Franchise');
  // await page.getByRole('link', { name: 'Logout' }).click();
  // await expect(page.locator('#navbar-dark')).toContainText('Login');
});

