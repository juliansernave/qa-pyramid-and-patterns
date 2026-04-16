/**
 * PYRAMID LAYER: API (base of the pyramid)
 *
 * Why these tests live at the API layer:
 *   - Login and account retrieval are business logic operations. The API
 *     contract (response shape, status codes, error messages) can break
 *     independently of the UI. Catching that here is faster and more precise
 *     than waiting for a UI test to fail.
 *   - A UI test for "login works" drives a browser, waits for renders, and
 *     mixes HTTP behavior with DOM behavior. An API test isolates the HTTP
 *     contract alone — narrower failure scope, 10x faster execution.
 *   - These tests run headless with no browser startup cost, making them
 *     cheap enough to run on every commit.
 */

const { test, expect } = require('../../fixtures/api.fixture');
const { createUser } = require('../../patterns/factory/user.factory');

test.describe('Accounts API', () => {
  test('login with valid credentials returns customer profile', async ({ authClient }) => {
    // WHY API: The login endpoint's response contract (fields, types) is a
    // server-side concern. Testing it here catches backend regressions without
    // a browser.
    const user = createUser();
    const { status, body } = await authClient.login(user.username, user.password);
    const customer = JSON.parse(body);

    expect(status).toBe(200);
    expect(customer.id).toBe(user.customerId);
    expect(customer.firstName).toBe(user.firstName);
    expect(customer.lastName).toBe(user.lastName);
  });

  test('login with invalid password returns 400 with error message', async ({ authClient }) => {
    // WHY API: Error handling is server-side logic. Verifying the status code
    // and message here is faster and more reliable than driving the UI error path.
    const { status, body } = await authClient.login('john', 'wrongpassword');

    expect(status).toBe(400);
    expect(body).toContain('Invalid username');
  });

  test('fetching accounts for a valid customer returns a non-empty list', async ({ accountsClient, authenticatedUser }) => {
    // WHY API: Account data retrieval is pure business logic — no rendering
    // involved. Verifying the shape and content of the list here is more
    // targeted than asserting table rows in a UI test.
    const { status, body } = await accountsClient.getAccounts(authenticatedUser.id);
    const accounts = JSON.parse(body);

    expect(status).toBe(200);
    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0]).toMatchObject({ customerId: authenticatedUser.id, type: expect.any(String) });
  });

  test('fetching accounts for a nonexistent customer returns 400', async ({ accountsClient }) => {
    // WHY API: Error responses for invalid IDs are a backend contract.
    // Testing this at API level gives a clear signal if error handling regresses.
    const { status, body } = await accountsClient.getAccounts(99999);

    expect(status).toBe(400);
    expect(body).toContain('Could not find customer');
  });
});
