import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../../src/service/pizzaService';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('menu page', async ({ page }) => {
  await page.goto('/menu');

  await expect(page.locator('form')).toContainText('Pick your store and pizzas from below. Remember to order extra for a midnight party.');
});


async function basicInit(page: Page) {
  await page.goto('/');
}


test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('register', async ({ page }) => {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'new@jwt.com': { id: '4', name: 'New User', email: 'new@jwt.com', password: 'a', roles: [{ role: Role.Diner }] } };

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const registerReq = route.request().postDataJSON();
    const user = validUsers[registerReq.email];
    if (!user || user.password !== registerReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[registerReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: loginRes });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill('New User');
  await page.getByRole('textbox', { name: 'Email address' }).fill('new@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('link', { name: 'NU' })).toBeVisible();
});

test('logout', async ({ page }) => {
  await basicInit(page);
   await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'Logout' }).click();

  await expect(page.locator('#navbar-dark')).toMatchAriaSnapshot(`
    - link "Register":
      - /url: /register
    `);
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});

test('about page', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('main')).toContainText('Our employees');;
});

test('history page', async ({ page }) => {
  await page.goto('/history');
  await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
} );