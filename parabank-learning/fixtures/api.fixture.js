const { test: base } = require('@playwright/test');
const { AuthClient } = require('../api/clients/auth.client');
const { AccountsClient } = require('../api/clients/accounts.client');
const { getAuthStrategy } = require('../patterns/strategy/auth.strategy');
const { createUser } = require('../patterns/factory/user.factory');

/**
 * Extends Playwright's base test with pre-built API clients and an
 * authenticated user object. API tests use this fixture so they don't
 * repeat client setup or auth calls in every file.
 */
const test = base.extend({
  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },

  accountsClient: async ({ request }, use) => {
    await use(new AccountsClient(request));
  },

  // Authenticates via the strategy selected by TEST_ENV (defaults to 'api')
  // and provides the customer data to tests that need it.
  authenticatedUser: async ({ request }, use) => {
    const user = createUser();
    const strategy = getAuthStrategy('api');
    const auth = strategy.init(request);
    const customer = await auth.authenticate({ username: user.username, password: user.password });
    await use({ ...user, ...customer });
  },
});

module.exports = { test, expect: base.expect };
