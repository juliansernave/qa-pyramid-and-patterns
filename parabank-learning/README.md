# ParaBank Learning Project

A minimal, runnable project demonstrating the **Test Pyramid** and three **Design Patterns** using Playwright + JavaScript against the live [ParaBank](https://parabank.parasoft.com/parabank) demo app.

This is a learning project. The goal is working code you can read, run, and reason about — not a production framework.

---

## Test Pyramid in This Project

```
        /\
       /  \
      / UI \        5 tests  — browser required
     /------\
    /  API   \      8 tests  — HTTP only, no browser
   /----------\
  (unit-level  )   (Builder validation test lives in API layer)
```

| Layer | Tests | What it covers |
|---|---|---|
| UI | 5 | Form rendering, error messages, post-login nav, AJAX dropdown, transfer confirmation |
| API | 8 | Login contract, account retrieval, transfer, createAccount, error responses |
| **Total** | **13** | |

**The key insight:** the API layer has more tests than the UI layer. That's intentional. Business logic (does the transfer work? does the error message match?) is validated cheaply at the HTTP level. The UI layer only tests what genuinely requires a browser — DOM presence, JavaScript-driven visibility changes, navigation.

---

## Design Patterns

### Factory — [`patterns/factory/user.factory.js`](patterns/factory/user.factory.js)

Creates user objects with sensible defaults. Tests call `createUser()` or `createUser({ password: 'wrong' })` instead of hardcoding `{ username: 'john', password: 'demo', ... }` everywhere.

**The problem it solves:** one change to the default user (e.g. the demo account is reset) means one change in the factory, not a grep-and-replace across every test file.

### Strategy — [`patterns/strategy/auth.strategy.js`](patterns/strategy/auth.strategy.js)

Two interchangeable auth implementations behind a uniform interface:

- `LocalAuthStrategy` — drives the real browser login form
- `ApiAuthStrategy` — calls the REST login endpoint directly

Fixtures call `getAuthStrategy(env).init(context)` and get back `{ authenticate(credentials) }` — the same call regardless of which strategy is active. Set `TEST_ENV=api` to switch.

**The problem it solves:** UI tests need browser-based auth; API tests need HTTP-based auth. Without the pattern, every fixture would have an `if/else` that scatters auth logic everywhere.

### Builder — [`patterns/builder/transfer.builder.js`](patterns/builder/transfer.builder.js)

Constructs transfer parameter objects via a readable chain:

```js
const params = new TransferBuilder()
  .from(12345)
  .to(12456)
  .amount(10)
  .build();  // throws if any field is missing or invalid
```

**The problem it solves:** `transfer(12345, 12456, 10)` is easy to misread and has no place to put validation. The builder makes intent obvious and catches mistakes (missing `.to()`, `amount <= 0`, same account for both sides) before hitting the network.

---

## How to Run

```bash
# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Run everything (API + UI)
npm test

# Run only API tests (fast, no browser)
npm run test:api

# Run only UI tests
npm run test:ui

# Open the HTML report after a run
npm run test:report
```

**Expected output:** 13 tests, all passing, in ~12 seconds.

---

## Project Structure

```
parabank-learning/
├── tests/
│   ├── api/
│   │   ├── accounts.api.spec.js   # login contract, account retrieval
│   │   └── transfer.api.spec.js   # transfer, createAccount, Builder validation
│   └── ui/
│       ├── login.spec.js          # form render, error message, navigation
│       └── transfer.spec.js       # AJAX dropdowns, confirmation message
├── pages/
│   ├── base.page.js               # goto(), waitForPageLoad()
│   ├── login.page.js              # loginAs(), getErrorMessage()
│   └── transfer.page.js           # open(), transfer(), getConfirmationText()
├── api/clients/
│   ├── auth.client.js             # wraps GET /login/{u}/{p}
│   └── accounts.client.js         # wraps accounts, transfer, createAccount
├── patterns/
│   ├── factory/user.factory.js    # createUser(), createAdminUser()
│   ├── strategy/auth.strategy.js  # LocalAuthStrategy, ApiAuthStrategy
│   └── builder/transfer.builder.js # TransferBuilder chain
└── fixtures/
    ├── api.fixture.js             # authClient, accountsClient, authenticatedUser
    └── pages.fixture.js           # loginPage, transferPage (pre-authenticated)
```

---

## What This Project Does NOT Include (and Why)

| Missing thing | Why it's missing |
|---|---|
| CI pipeline | Would add YAML complexity without teaching anything about testing. Add it when you need it. |
| Multiple environments | ParaBank is a single public demo server. An `env` config layer would be indirection for its own sake. |
| Custom reporters | The built-in HTML reporter is sufficient. Custom reporters are an operational concern, not a learning one. |
| Docker / containerisation | ParaBank is already hosted. Running your own instance is an ops topic, not a testing topic. |
| Schema validation | JSON schema files add a layer of indirection. Inline `toMatchObject` assertions are clearer for learning. |
| Component Objects / Page Sections | ParaBank pages are simple enough that full POM is sufficient. Component objects earn their complexity when pages have repeated sub-sections (e.g. a header used across 20 pages). |
| Data cleanup | ParaBank is a shared demo app. Accounts created by tests accumulate. A real project would track and delete test data, but that would distract from the patterns being demonstrated here. |
