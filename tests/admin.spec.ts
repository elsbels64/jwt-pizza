import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { "a@jwt.com": { id: '1', name: "常用名字", email: "a@jwt.com", password: "admin", roles: ([{ role: Role.Admin }]) } };
  let franchises = [
    {
      id: '1',
      name: 'pizzaPocket',
      admins: [{ id: '4', name: "pizza franchisee", email: "f@jwt.com" }],
      stores: [{ id: '1', name: "SLC", totalRevenue: 0 }]
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
  await page.route('*/**/api/franchise**', async (route) => {
    if (route.request().method() === 'GET') {
      if (route.request().url().includes('name=') && route.request().url().split('name=')[1] !== '*') {
        const url = new URL(route.request().url());
        const rawFilter = url.searchParams.get('name')||'';

        const pattern = new RegExp(
          '^' + rawFilter.replace(/\*/g, '.*') + '$'
        );

        const filteredFranchises = franchises.filter(f =>
          pattern.test(f.name)
        );
        await route.fulfill({ json: { franchises: filteredFranchises, more: false } });
      } else {

        const franchiseRes = {
          franchises: franchises,
          more: false
        };
        await route.fulfill({ json: franchiseRes });
      }
    } else if (route.request().method() === 'POST') {
      const newFranchise = { id: '12', name: 'New Franchise', admins: [{ email: "f@jwt.com", id: '4', name: "pizza franchisee" }], stores: [] };
      franchises.push(newFranchise);
      franchises = franchises.sort((a, b) => a.name.localeCompare(b.name));
      await route.fulfill({ json: newFranchise });
    } else if (route.request().method() === 'DELETE') {
      // DELETE /api/franchise/12 HTTP/1.1
      // {"message":"franchise deleted"}
      const url = route.request().url();
      const idToDelete = route.request().url().match(/\/(\d+)(\?|$)/)?.[1];
      franchises = franchises.filter(f => String(f.id) !== String(idToDelete));
      await route.fulfill({ json: { message: 'franchise deleted' } });
    }
  });

  await page.goto('/');
}



test('login admin and open admin page and add franchise', async ({ page }) => {
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
  await expect(page.locator('h3')).toContainText('Franchises');

  //add a franchise
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('New Franchise');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('f@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('table')).toContainText('New Franchise');


  // //filter franchises
  await page.getByRole('textbox', { name: 'Filter franchises' }).click();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('pizzaPocket');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('tbody')).toContainText('pizzaPocket');
  await expect(page.getByRole('table')).not.toContainText('New Franchise');
  await page.getByRole('textbox', { name: 'Filter franchises' }).dblclick();
  await page.getByRole('textbox', { name: 'Filter franchises' }).fill('');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('table')).toContainText('New Franchise');
  await expect(page.getByRole('table')).toContainText('pizzaPocket');
  // //delete a franchise
  await page.getByRole('row', { name: 'New Franchise pizza' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await expect(page.getByRole('main')).toContainText('New Franchise');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('table')).toContainText('pizzaPocket');
  await expect(page.getByRole('table')).not.toContainText('New Franchise');
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Login');
});