import { test, expect } from 'playwright-test-coverage';

// Helper that sets up auth + user mocks with a mutable user state
async function setupUserMocks(page: any, initialUser: { id: number; name: string; email: string; password: string; roles: { role: string }[] }) {
  let user = { ...initialUser };
  const token = 'mock-token-' + initialUser.id;

  // POST /api/auth — Register
  await page.route('**/api/auth', async (route: any) => {
    const method = route.request().method();

    if (method === 'POST') {
      // Parse the request body to capture any name/email sent
      const body = route.request().postDataJSON();
      // Update mutable state so re-login reflects the latest credentials
      if (body.name) user.name = body.name;
      if (body.email) user.email = body.email;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles,
          },
          token,
        }),
      });

    } else if (method === 'PUT') {
      // PUT /api/auth — Login (some backends use PUT for login)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles,
          },
          token,
        }),
      });

    } else if (method === 'DELETE') {
      // DELETE /api/auth — Logout
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'logout successful' }),
      });

    } else {
      await route.continue();
    }
  });

  // PUT /api/user/:id — Update user (name, email, password)
  await page.route(`**/api/user/${initialUser.id}`, async (route: any) => {
    const body = route.request().postDataJSON();

    // Apply any changes to mutable user state
    if (body.name) user.name = body.name;
    if (body.email) user.email = body.email;
    if (body.password) user.password = body.password;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
        token,
      }),
    });
  });

  // GET /api/order — Fetch orders for the diner
  await page.route('**/api/order', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        dinerId: user.id,
        orders: [],
        page: 1,
      }),
    });
  });
}

// ──────────────────────────────────────────────
// Test 1: update name
// ──────────────────────────────────────────────
test('updateUser', async ({ page }) => {

     test.setTimeout(30000);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

  await setupUserMocks(page, {
    id: 1001,
    name: 'pizza diner',
    email,
    password: 'diner',
    roles: [{ role: 'diner' }],
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await expect(page.getByRole('main')).toContainText('pizza diner');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

// ──────────────────────────────────────────────
// Test 2: update name as franchisee
// ──────────────────────────────────────────────
test('updateUser franchisee', async ({ page }) => {
     test.setTimeout(30000);
  const email = `franchisee${Math.floor(Math.random() * 10000)}@jwt.com`;

  await setupUserMocks(page, {
    id: 1002,
    name: 'pizza franchise',
    email,
    password: 'franchise',
    roles: [{ role: 'franchisee' }],
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza franchise');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('franchise');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pf' }).click();
  await expect(page.getByRole('main')).toContainText('pizza franchise');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza franchisex');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
  await expect(page.getByRole('main')).toContainText('pizza franchisex');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('franchise');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pf' }).click();
  await expect(page.getByRole('main')).toContainText('pizza franchisex');
});

// ──────────────────────────────────────────────
// Test 3: update password
// ──────────────────────────────────────────────
test('updateUser password', async ({ page }) => {
     test.setTimeout(30000);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

  await setupUserMocks(page, {
    id: 1003,
    name: 'pizza diner',
    email,
    password: 'diner',
    roles: [{ role: 'diner' }],
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await expect(page.getByRole('main')).toContainText('pizza diner');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.locator('#password').fill('dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
  await expect(page.getByRole('main')).toContainText('pizza diner');

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  // Login with NEW password
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('dinerx');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await expect(page.getByRole('main')).toContainText('pizza diner');
});

// ──────────────────────────────────────────────
// Test 4: update email
// ──────────────────────────────────────────────
test('updateUser email', async ({ page }) => {
     test.setTimeout(30000);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  const newEmail = 'user1284@jwtx.com';

  await setupUserMocks(page, {
    id: 1004,
    name: 'pizza diner',
    email,
    password: 'diner',
    roles: [{ role: 'diner' }],
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await expect(page.getByRole('main')).toContainText('pizza diner');
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.locator('input[type="email"]').fill(newEmail);
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
  await expect(page.getByRole('main')).toContainText(newEmail);

  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  // Login with NEW email
  await page.getByRole('textbox', { name: 'Email address' }).fill(newEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();
  await expect(page.getByRole('main')).toContainText('pizza diner');
  await expect(page.getByRole('main')).toContainText(newEmail);
});