/**
 * STRATEGY PATTERN
 *
 * Problem it solves:
 *   Different test layers need different ways to authenticate. UI tests must
 *   drive the login form (slow, but tests the real user path). API tests
 *   should authenticate via HTTP directly (fast, no browser overhead). Without
 *   a Strategy, every fixture or test would branch on the environment with
 *   if/else, scattering auth logic everywhere.
 *
 * When to use it:
 *   - The same logical operation (auth, data export, notification) can be
 *     executed multiple ways depending on context
 *   - You want to swap implementations without changing the calling code
 *   - You're testing different layers of a system (UI vs API vs DB)
 *
 * When it's overkill:
 *   - There's only ever one way to do the thing
 *   - The "strategies" would be 1-liners — just use a function argument
 *
 * How it applies here:
 *   Each strategy exposes an init(context) method that captures its Playwright
 *   context (page or request) and returns a plain { authenticate(credentials) }
 *   object. The fixture calls init() once and hands tests a uniform
 *   authenticate(credentials) function — tests never see which context type
 *   is underneath.
 *
 *   Fixture usage:
 *     const strategy = getAuthStrategy('local');
 *     const auth = strategy.init(page);       // or strategy.init(request)
 *     await auth.authenticate({ username, password });
 */

/**
 * UI strategy: fills and submits the ParaBank login form.
 * Use when the login FLOW itself is under test, or for UI tests
 * that need an authenticated browser session.
 */
const LocalAuthStrategy = {
  name: 'local',

  init(page) {
    return {
      async authenticate({ username, password }) {
        // Login form is on index.htm — login.htm is only the POST target
        await page.goto('/parabank/index.htm');
        await page.fill('input[name="username"]', username);
        await page.fill('input[name="password"]', password);
        await page.click('input[type="submit"]');
        await page.waitForURL('**/overview.htm');
      },
    };
  },
};

/**
 * API strategy: authenticates directly over HTTP.
 * Use when you need an authenticated state for API tests, or when
 * UI tests need setup (auth) without exercising the login form.
 */
const ApiAuthStrategy = {
  name: 'api',

  init(request) {
    return {
      async authenticate({ username, password }) {
        const response = await request.get(
          `/parabank/services/bank/login/${username}/${password}`,
          { headers: { Accept: 'application/json' } }
        );

        if (!response.ok()) {
          throw new Error(`API auth failed: ${response.status()} for user "${username}"`);
        }

        return response.json();
      },
    };
  },
};

/**
 * Returns the appropriate strategy based on TEST_ENV.
 * Defaults to 'local' (UI) so developers running tests manually get
 * the full visual login experience by default.
 *
 * @param {'local' | 'api'} env
 */
function getAuthStrategy(env = process.env.TEST_ENV || 'local') {
  const strategies = {
    local: LocalAuthStrategy,
    api: ApiAuthStrategy,
  };

  const strategy = strategies[env];
  if (!strategy) {
    throw new Error(`Unknown auth strategy: "${env}". Valid options: ${Object.keys(strategies).join(', ')}`);
  }

  return strategy;
}

module.exports = { LocalAuthStrategy, ApiAuthStrategy, getAuthStrategy };
