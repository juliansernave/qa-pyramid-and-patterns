/**
 * PYRAMID LAYER: API (base of the pyramid)
 *
 * Why these tests live at the API layer:
 *   - A fund transfer is a financial transaction. Validating that the API
 *     accepts correct params and rejects invalid ones belongs here — not in a
 *     UI test that also asserts page titles and button states.
 *   - The TransferBuilder pattern is demonstrated here: tests construct params
 *     via the builder chain, which validates inputs before hitting the network.
 *   - Running these headlessly on every commit gives fast feedback if the
 *     transfer endpoint regresses — no browser startup, no DOM waiting.
 */

const { test, expect } = require('../../fixtures/api.fixture');
const { TransferBuilder } = require('../../patterns/builder/transfer.builder');

test.describe('Transfer API', () => {
  test('valid transfer between two accounts returns success message', async ({ accountsClient, authenticatedUser }) => {
    // WHY API: The success response is a server contract ("Successfully transferred…").
    // Verifying the exact text here catches subtle regressions in the response body
    // without involving any UI rendering.
    const { status: accountsStatus, body: accountsBody } = await accountsClient.getAccounts(authenticatedUser.id);
    expect(accountsStatus).toBe(200);
    const accounts = JSON.parse(accountsBody);

    const params = new TransferBuilder()
      .from(accounts[0].id)
      .to(accounts[1].id)
      .amount(1)
      .build();

    const { status, body } = await accountsClient.transfer(
      params.fromAccountId,
      params.toAccountId,
      params.amount
    );

    expect(status).toBe(200);
    expect(body).toContain('Successfully transferred');
    expect(body).toContain(`$${params.amount}`);
  });

  test('transfer from a nonexistent account returns 400', async ({ accountsClient, authenticatedUser }) => {
    // WHY API: Invalid-account error handling is backend logic. A UI test
    // for this scenario would be slow and harder to trigger reliably.
    const { body: accountsBody } = await accountsClient.getAccounts(authenticatedUser.id);
    const accounts = JSON.parse(accountsBody);

    const params = new TransferBuilder()
      .from(99999)
      .to(accounts[0].id)
      .amount(1)
      .build();

    const { status, body } = await accountsClient.transfer(
      params.fromAccountId,
      params.toAccountId,
      params.amount
    );

    expect(status).toBe(400);
    expect(body).toContain('Could not find account');
  });

  test('TransferBuilder throws before the network call if .to() is missing', async () => {
    // WHY API: Builder validation is a unit-level concern — no HTTP call needed.
    // This test lives in the API layer because it validates the data-construction
    // contract that all transfer tests depend on.
    expect(() => {
      new TransferBuilder().from(12345).amount(10).build();
    }).toThrow('to(accountId) is required');
  });

  test('creating a new savings account returns the new account object', async ({ accountsClient, authenticatedUser }) => {
    // WHY API: Account creation is a backend operation. Verifying the returned
    // object shape (id, type, customerId) here is faster and more precise than
    // asserting a success banner in the UI.
    const { body: accountsBody } = await accountsClient.getAccounts(authenticatedUser.id);
    const accounts = JSON.parse(accountsBody);
    const fundingAccountId = accounts[0].id;

    // newAccountType: 0 = CHECKING, 1 = SAVINGS
    const { status, body } = await accountsClient.createAccount(
      authenticatedUser.id,
      1,
      fundingAccountId
    );
    const newAccount = JSON.parse(body);

    expect(status).toBe(200);
    expect(newAccount.customerId).toBe(authenticatedUser.id);
    expect(newAccount.type).toBe('SAVINGS');
    expect(typeof newAccount.id).toBe('number');
  });
});
