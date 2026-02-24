import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

let allUsers = [
  { id: 1, name: '常用名字', email: 'a@jwt.com', roles: [{ role: 'admin' }] },
  { id: 2, name: 'pizza diner', email: 'd@jwt.com', roles: [{ role: 'diner' }] },
  { id: 3, name: 'pizza franchisee', email: 'f@jwt.com', roles: [{ role: 'diner' }, { role: 'franchisee', objectId: 1 }] },
  { id: 864, name: 'pizza dinerx', email: 'user1753@jwt.com', roles: [{ role: 'diner' }] },
  { id: 865, name: 'pizza franchisex', email: 'franchisee3183@jwt.com', roles: [{ role: 'diner' }] },
  { id: 866, name: 'pizza diner', email: 'user3160@jwt.com', roles: [{ role: 'diner' }] },
  { id: 867, name: 'pizza diner', email: 'user1284@jwtx.com', roles: [{ role: 'diner' }] },
  { id: 869, name: 'Marco Rossi', email: 'marco@jwt.com', roles: [{ role: 'diner' }] },
  { id: 870, name: 'Yuki Tanaka', email: 'yuki@jwt.com', roles: [{ role: 'diner' }] },
  { id: 871, name: 'Amara Osei', email: 'amara@jwt.com', roles: [{ role: 'diner' }] },
  { id: 872, name: 'Lars Eriksson', email: 'lars@jwt.com', roles: [{ role: 'diner' }] },
  { id: 873, name: 'Sofia Mendez', email: 'sofia@jwt.com', roles: [{ role: 'franchisee', objectId: 2 }] },
  { id: 874, name: 'Chen Wei', email: 'chenwei@jwt.com', roles: [{ role: 'diner' }] },
  { id: 875, name: 'Fatima Al-Hassan', email: 'fatima@jwt.com', roles: [{ role: 'diner' }] },
  { id: 876, name: 'James Kowalski', email: 'james@jwt.com', roles: [{ role: 'admin' }] },
  { id: 877, name: 'Priya Nair', email: 'priya@jwt.com', roles: [{ role: 'diner' }] },
  { id: 878, name: 'Tobias Müller', email: 'tobias@jwt.com', roles: [{ role: 'diner' }] },
];

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

 // PUT /api/auth 


  await page.route('*/**/api/user**', async (route) => {
    if (route.request().method() === 'DELETE') {
      // get id from url /api/user/123
      const idToDelete = route.request().url().match(/\/api\/user\/(\d+)/)?.[1];
      allUsers = allUsers.filter(u => String(u.id) !== String(idToDelete));
      await route.fulfill({ json: { message: 'user deleted' } });
    } else if (route.request().method() === 'GET') {
    const url = new URL(route.request().url());
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const name = url.searchParams.get('name') || '*';

    // filter by name (convert * wildcards to regex)
    const nameRegex = new RegExp(name.replace(/\*/g, '.*'), 'i');
    const filtered = allUsers.filter((u) => nameRegex.test(u.name));

    // paginate
    const offset = (page - 1) * limit;
    const pageUsers = filtered.slice(offset, offset + limit);
    const more = filtered.length > offset + limit;

    await route.fulfill({ json: pageUsers });
    }
  });

  //return franchises
  await page.route('*/**/api/franchise**', async (route) => {
    if (route.request().method() === 'GET') {
      if (route.request().url().includes('name=') && route.request().url().split('name=')[1] !== '*') {
        const url = new URL(route.request().url());
        const rawFilter = url.searchParams.get('name') || '';

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
      const url = route.request().url();
      if (route.request().url().includes('/store/')) {
        // DELETE /api/franchise/1/store/1 HTTP/1.1
        //{"message":"store deleted"}
        //{"franchises":[{"id":1,"name":"pizzaPocket","admins":[{"id":4,"name":"pizza franchisee","email":"f@jwt.com"}],"stores":[]}],"more":false}
        const ids = url.match(/\/franchise\/(\d+)\/store\/(\d+)/);
        const franchiseId = ids?.[1];
        const storeId = ids?.[2];
        const franchise = franchises.find(f => String(f.id) === String(franchiseId));
        if (franchise) {
          franchise.stores = franchise.stores.filter(s => String(s.id) !== String(storeId));
        }
        await route.fulfill({ json: { message: 'store deleted' } });
      } else {
        // DELETE /api/franchise/12 HTTP/1.1
        // {"message":"franchise deleted"}
        const idToDelete = route.request().url().match(/\/(\d+)(\?|$)/)?.[1];
        franchises = franchises.filter(f => String(f.id) !== String(idToDelete));
        await route.fulfill({ json: { message: 'franchise deleted' } });
      }
    }
  });

  await page.goto('/');
}



test('delete user from admin page', async ({ page }) => {
  await basicInit(page);
  // add new user to delete later
  allUsers.splice(4, 0, { id: 868, name: 'new user', email: 'newuser@jwt.com', roles: [{ role: 'diner' }] });
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
  
  await expect(page.getByRole('main')).not.toContainText('new user');

  //go to admin page
  //GET /api/franchise?page=0&limit=3&name=* HTTP/1.1
  //{"franchises":[{"id":1,"name":"pizzaPocket","admins":[{"id":3,"name":"pizza franchisee","email":"f@jwt.com"}],"stores":[{"id":1,"name":"SLC","totalRevenue":0}]}],"more":false}

  //[{"id":1,"name":"常用名字","email":"a@jwt.com","roles":[{"role":"admin"}]},{"id":2,"name":"pizza diner","email":"d@jwt.com","roles":[{"role":"diner"}]},{"id":3,"name":"pizza franchisee","email":"f@jwt.com","roles":[{"role":"diner"},{"role":"franchisee","objectId":1}]},{"id":864,"name":"pizza dinerx","email":"user1753@jwt.com","roles":[{"role":"diner"}]},{"id":865,"name":"pizza franchisex","email":"franchisee3183@jwt.com","roles":[{"role":"diner"}]},{"id":866,"name":"pizza diner","email":"user3160@jwt.com","roles":[{"role":"diner"}]},{"id":867,"name":"pizza diner","email":"user1284@jwtx.com","roles":[{"role":"diner"}]}]

  
  // GET /api/user?page=1&limit=10&name=* HTTP/1.1
  //[{"id":1,"name":"常用名字","email":"a@jwt.com","roles":[{"role":"admin"}]},{"id":2,"name":"pizza diner","email":"d@jwt.com","roles":[{"role":"diner"}]},{"id":3,"name":"pizza franchisee","email":"f@jwt.com","roles":[{"role":"diner"},{"role":"franchisee","objectId":1}]},{"id":190,"name":"new user","email":"email@email.com","roles":[{"role":"diner"}]}]

  //DELETE /api/user/190 HTTP/1.1
  //{"message":"user deleted"}


  //GET /api/user?page=1&limit=10&name=* HTTP/1.1

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
  await expect(page.locator('tbody')).not.toContainText('SLC');

  await expect(page.getByRole('main')).not.toContainText('New Franchise');
  // await page.getByRole('link', { name: 'Logout' }).click();
  // await expect(page.locator('#navbar-dark')).toContainText('Login');
});

