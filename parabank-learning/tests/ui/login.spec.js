/**
 * PYRAMID LAYER: UI (top of the pyramid)
 *
 * Why these tests live at the UI layer:
 *   - Login form rendering is a browser concern. Whether the username input,
 *     password input, and submit button are present and visible cannot be
 *     tested at the API layer — the API has no concept of DOM elements.
 *   - The error MESSAGE ("The username and password could not be verified.")
 *     is rendered by the server into HTML. Testing that it appears correctly
 *     in the DOM is inherently a UI-layer concern.
 *   - Post-login navigation (redirect to overview) involves a browser URL
 *     change and page render — not visible to an API test.
 *
 * What is NOT tested here (and why):
 *   - Whether the credentials are validated correctly → that's API layer
 *   - Session token handling → that's API/integration layer
 */

const { test, expect } = require('../../fixtures/pages.fixture');
const { createUser } = require('../../patterns/factory/user.factory');

test.describe('Login UI', () => {
  test('login form renders with username, password, and submit button', async ({ loginPage }) => {
    // WHY UI: Form element presence is a DOM concern — only a browser can
    // assert that the correct inputs exist and are visible to the user.
    await loginPage.goto(loginPage.url);

    await expect(loginPage.page.locator('input[name="username"]')).toBeVisible();
    await expect(loginPage.page.locator('input[name="password"]')).toBeVisible();
    await expect(loginPage.page.locator('input[type="submit"]')).toBeVisible();
  });

  test('invalid credentials show an error message on the page', async ({ loginPage }) => {
    // WHY UI: The error message is rendered into the DOM by the server.
    // An API test catches the 400 status, but only a UI test can verify
    // that the error text actually appears where users can see it.
    const user = createUser({ password: 'wrongpassword' });
    await loginPage.loginAs(user);

    expect(loginPage.isOnErrorPage()).toBe(true);
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('could not be verified');
  });

  test('valid credentials navigate to the account overview page', async ({ loginPage }) => {
    // WHY UI: Post-login navigation is a browser event — the redirect and
    // resulting page render are only observable through a browser.
    const user = createUser();
    await loginPage.loginAs(user);
    await loginPage.page.waitForURL('**/overview.htm');

    expect(loginPage.page.url()).toContain('overview.htm');
    // overview.htm has multiple h1.title elements — scope to first visible heading
    await expect(loginPage.page.locator('h1.title').first()).toContainText('Accounts Overview');
  });
});
