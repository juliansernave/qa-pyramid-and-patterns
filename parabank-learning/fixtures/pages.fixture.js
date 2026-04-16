const { test: base } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { TransferPage } = require('../pages/transfer.page');
const { getAuthStrategy } = require('../patterns/strategy/auth.strategy');
const { createUser } = require('../patterns/factory/user.factory');

/**
 * Extends Playwright's base test with pre-built page objects.
 * The authenticatedPage fixture handles login so transfer tests don't
 * need to repeat the login flow — they get a ready-to-use TransferPage.
 */
const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  transferPage: async ({ page }, use) => {
    // Use LocalAuthStrategy: drives the real login form so the browser
    // session cookie is set correctly before navigating to the transfer page.
    const user = createUser();
    const strategy = getAuthStrategy('local');
    const auth = strategy.init(page);
    await auth.authenticate({ username: user.username, password: user.password });
    await use(new TransferPage(page));
  },
});

module.exports = { test, expect: base.expect };
