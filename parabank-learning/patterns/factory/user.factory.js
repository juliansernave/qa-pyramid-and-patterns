/**
 * FACTORY PATTERN
 *
 * Problem it solves:
 *   Tests need valid user objects, but hardcoding the same user data everywhere
 *   makes tests brittle. Change one field and you hunt down every test that
 *   used the old value. The Factory centralizes object creation so tests say
 *   WHAT they need, not HOW to build it.
 *
 * When to use it:
 *   - You create the same type of object in many tests
 *   - Tests need slight variations of a base object (e.g. "a user with no phone")
 *   - Test data has required fields that must always be present
 *
 * When it's overkill:
 *   - You only have 1-2 tests that need a user object — just inline it
 *   - The object has a single field — a const is enough
 *
 * How it applies here:
 *   ParaBank has a fixed demo user (john/demo). The factory produces the
 *   matching data object so tests don't hardcode "john" and "demo" everywhere.
 *   The spread override pattern lets individual tests customize only what
 *   they care about without affecting others.
 */

const DEFAULT_USER = {
  username: 'john',
  password: 'demo',
  firstName: 'John',
  lastName: 'Smith',
  customerId: 12212,
};

/**
 * Creates a standard ParaBank user.
 * @param {Partial<typeof DEFAULT_USER>} overrides
 */
function createUser(overrides = {}) {
  return { ...DEFAULT_USER, ...overrides };
}

/**
 * Creates a user variant with admin-level access assumptions.
 * ParaBank doesn't have real roles, but this shows the factory variant pattern.
 * @param {Partial<typeof DEFAULT_USER>} overrides
 */
function createAdminUser(overrides = {}) {
  return createUser({ username: 'admin', password: 'admin', ...overrides });
}

module.exports = { createUser, createAdminUser };
