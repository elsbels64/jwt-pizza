import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

async function basicInit(page: Page) {
    let loggedInUser: User | undefined;
    const validUsers: Record<string, User> = { "f@jwt.com": { id: '4', name: "pizza franchisee", email: "f@jwt.com", password: "franchisee", roles: ([{ role: Role.Franchisee }]) } };

    //PUT /api/auth HTTP/1.1
    // {"user":{"id":4,"name":"pizza franchisee","email":"f@jwt.com","roles":[{"role":"diner"},{"objectId":1,"role":"franchisee"}]},"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6InBpenphIGZyYW5jaGlzZWUiLCJlbWFpbCI6ImZAand0LmNvbSIsInJvbGVzIjpbeyJyb2xlIjoiZGluZXIifSx7Im9iamVjdElkIjoxLCJyb2xlIjoiZnJhbmNoaXNlZSJ9XSwiaWF0IjoxNzcwODcwMjc0fQ.gXCU7dkTuzWJ6nhPPFz8Fd0lGRsfp50moNiVfoFyruI"}

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

    //GET /api/franchise/4 HTTP/1.1
    //[{"id":1,"name":"pizzaPocket","admins":[{"id":4,"name":"pizza franchisee","email":"f@jwt.com"}],"stores":[{"id":2,"name":"SLC","totalRevenue":0}]}]

    await page.route('*/**/api/franchise**', async (route) => {
        if (route.request().method() === 'GET') {
            if (route.request().url().includes("4")) {
                await route.fulfill({ json: franchises });
            } else {
                await route.fulfill({ json: { franchises, more: false } });
            }
            return;
        } else if (route.request().method() === 'POST') {
            // POST /api/franchise/1/store HTTP/1.1
            // {"id":3,"franchiseId":1,"name":"new store"}
            // [{"id":1,"name":"pizzaPocket","admins":[{"id":4,"name":"pizza franchisee","email":"f@jwt.com"}],"stores":[{"id":2,"name":"SLC","totalRevenue":0},{"id":3,"name":"new store","totalRevenue":0}]}]

            franchises[0].stores.push({ id: '3', name: "new store", totalRevenue: 0 });
            await route.fulfill({ json: { id: '3', franchiseId: '1', name: "new store" } });
            return;
        } else if (route.request().method() === 'DELETE') {
            //DELETE /api/franchise/1/store/3 HTTP/1.1
            // {"message":"store deleted"}
            franchises[0].stores = franchises[0].stores.filter(s => s.id !== '3');
            await route.fulfill({ json: { message: "store deleted" } });
            return;
        }
    });

    await page.goto('/');
};

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

    // // logout
    // await page.getByRole('link', { name: 'Logout' }).click();    

});

// test.describe('Franchisee dashboard', () => {


//     test('Franchisee can view their franchises and stores', async ({ page }) => {
//         await basicInit(page);

