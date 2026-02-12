import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {"a@jwt.com":{id:'1',name:"常用名字",email:"a@jwt.com",password:"admin",roles:([{role:Role.Admin}])}};
  let franchises = [
    {
      id: '1',
      name: 'pizzaPocket',
      admins:[{id:'4',name:"pizza franchisee",email:"f@jwt.com"}],
      stores:[{id:'1',name:"SLC",totalRevenue:0}]
    }
  ];

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    if (route.request().method() === 'DELETE') {
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({ json: { message: 'logout successful' } });
    } if (route.request().method() === 'PUT') {
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
        return;
      }
      loggedInUser = validUsers[loginReq.email];
      const loginRes = {
        user: loggedInUser,
        token: 'abcdef',
      };

      await route.fulfill({ json: loginRes });
    }
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  //return franchises
  await page.route('*/**/api/franchise*', async (route) => {
    if (route.request().method() === 'GET') {
  
      const franchiseRes = {
        franchises: franchises,
        more:false
      };
      await route.fulfill({ json: franchiseRes });
    }
  });

  await page.goto('/');
}



test('login admin and open admin page', async ({ page }) => {
  basicInit(page);
  //login admin
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  
  //go to admin page
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.locator('h3')).toContainText('Franchises');
  
  //add a franchise
  // await page.getByRole('button', { name: 'Add Franchise' }).click();
  // await page.getByRole('textbox', { name: 'franchise name' }).click();
  // await page.getByRole('textbox', { name: 'franchise name' }).fill('New Franchise');
  // await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  // await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('d@jwt.com');
  // await page.getByRole('button', { name: 'Create' }).click();
  // await expect(page.getByRole('table')).toContainText('New Franchise');

  // //filter franchises
  // await page.getByRole('textbox', { name: 'Filter franchises' }).click();
  // await page.getByRole('textbox', { name: 'Filter franchises' }).fill('pizzaPocket');
  // await page.getByRole('button', { name: 'Submit' }).click();
  // await expect(page.locator('tbody')).toContainText('pizzaPocket');
  // await page.getByRole('textbox', { name: 'Filter franchises' }).dblclick();
  // await page.getByRole('textbox', { name: 'Filter franchises' }).fill('');
  // await page.getByRole('button', { name: 'Submit' }).click();

  // //delete a franchise
  // await expect(page.getByRole('table')).toContainText('New Franchise');
  // await page.getByRole('row', { name: 'New Franchise pizza diner' }).getByRole('button').click();
  // await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  // await page.getByRole('button', { name: 'Close' }).click();
  // await expect(page.locator('tbody')).toContainText('pizzaPocket');
});