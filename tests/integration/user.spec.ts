import { test, expect } from 'playwright-test-coverage';


async function basicInit(page: Page) {
  await page.goto('/');
}


// ──────────────────────────────────────────────
// Test 1: update name
// ──────────────────────────────────────────────
test('updateUser', async ({ page }) => {

     test.setTimeout(30000);
  const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
  await basicInit(page);

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

// // ──────────────────────────────────────────────
// // Test 2: update name as franchisee
// // ──────────────────────────────────────────────
// test('updateUser franchisee', async ({ page }) => {
//      test.setTimeout(30000);
//   const email = `franchisee${Math.floor(Math.random() * 10000)}@jwt.com`;
//   await basicInit(page);
  
//   await page.getByRole('link', { name: 'Register' }).click();
//   await page.getByRole('textbox', { name: 'Full name' }).fill('pizza franchise');
//   await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//   await page.getByRole('textbox', { name: 'Password' }).fill('franchise');
//   await page.getByRole('button', { name: 'Register' }).click();

//   await page.getByRole('link', { name: 'pf' }).click();
//   await expect(page.getByRole('main')).toContainText('pizza franchise');
//   await page.getByRole('button', { name: 'Edit' }).click();
//   await expect(page.locator('h3')).toContainText('Edit user');
//   await page.getByRole('textbox').first().fill('pizza franchisex');
//   await page.getByRole('button', { name: 'Update' }).click();

//   await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
//   await expect(page.getByRole('main')).toContainText('pizza franchisex');

//   await page.getByRole('link', { name: 'Logout' }).click();
//   await page.getByRole('link', { name: 'Login' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//   await page.getByRole('textbox', { name: 'Password' }).fill('franchise');
//   await page.getByRole('button', { name: 'Login' }).click();

//   await page.getByRole('link', { name: 'pf' }).click();
//   await expect(page.getByRole('main')).toContainText('pizza franchisex');
// });

// // ──────────────────────────────────────────────
// // Test 3: update password
// // ──────────────────────────────────────────────
// test('updateUser password', async ({ page }) => {
//      test.setTimeout(30000);
//   const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
//   await basicInit(page);
//   await page.getByRole('link', { name: 'Register' }).click();
//   await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
//   await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//   await page.getByRole('textbox', { name: 'Password' }).fill('diner');
//   await page.getByRole('button', { name: 'Register' }).click();

//   await page.getByRole('link', { name: 'pd' }).click();
//   await expect(page.getByRole('main')).toContainText('pizza diner');
//   await page.getByRole('button', { name: 'Edit' }).click();
//   await expect(page.locator('h3')).toContainText('Edit user');
//   await page.locator('#password').fill('dinerx');
//   await page.getByRole('button', { name: 'Update' }).click();

//   await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
//   await expect(page.getByRole('main')).toContainText('pizza diner');

//   await page.getByRole('link', { name: 'Logout' }).click();
//   await page.getByRole('link', { name: 'Login' }).click();
//   // Login with NEW password
//   await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//   await page.getByRole('textbox', { name: 'Password' }).fill('dinerx');
//   await page.getByRole('button', { name: 'Login' }).click();

//   await page.getByRole('link', { name: 'pd' }).click();
//   await expect(page.getByRole('main')).toContainText('pizza diner');
// });

// // ──────────────────────────────────────────────
// // Test 4: update email
// // ──────────────────────────────────────────────
// test('updateUser email', async ({ page }) => {
//      test.setTimeout(30000);
//   const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
//   const newEmail = 'user1284@jwtx.com';

//   await basicInit(page);
//   await page.getByRole('link', { name: 'Register' }).click();
//   await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
//   await page.getByRole('textbox', { name: 'Email address' }).fill(email);
//   await page.getByRole('textbox', { name: 'Password' }).fill('diner');
//   await page.getByRole('button', { name: 'Register' }).click();

//   await page.getByRole('link', { name: 'pd' }).click();
//   await expect(page.getByRole('main')).toContainText('pizza diner');
//   await page.getByRole('button', { name: 'Edit' }).click();
//   await expect(page.locator('h3')).toContainText('Edit user');
//   await page.locator('input[type="email"]').fill(newEmail);
//   await page.getByRole('button', { name: 'Update' }).click();

//   await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
//   await expect(page.getByRole('main')).toContainText(newEmail);

//   await page.getByRole('link', { name: 'Logout' }).click();
//   await page.getByRole('link', { name: 'Login' }).click();
//   // Login with NEW email
//   await page.getByRole('textbox', { name: 'Email address' }).fill(newEmail);
//   await page.getByRole('textbox', { name: 'Password' }).fill('diner');
//   await page.getByRole('button', { name: 'Login' }).click();

//   await page.getByRole('link', { name: 'pd' }).click();
//   await expect(page.getByRole('main')).toContainText('pizza diner');
//   await expect(page.getByRole('main')).toContainText(newEmail);
// });