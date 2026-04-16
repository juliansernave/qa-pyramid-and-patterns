/**
 * PYRAMID LAYER: UI (top of the pyramid)
 *
 * Why these tests live at the UI layer:
 *   - The transfer confirmation ("Transfer Complete!") is rendered into the
 *     DOM by JavaScript after a successful AJAX call. Whether that element
 *     becomes visible — and contains the right text — is a browser concern.
 *   - The transfer form uses dynamically populated dropdowns (accounts loaded
 *     via AJAX). Testing that accounts are available as selectable options
 *     requires a browser that can execute JavaScript.
 *
 * What is NOT tested here (and why):
 *   - Whether the transfer actually moves money → API layer (faster, precise)
 *   - Validation of account IDs → API layer
 *   - Edge cases like zero amounts or missing accounts → API layer
 *   These scenarios are already covered in transfer.api.spec.js, so adding
 *   them here would duplicate coverage without adding value.
 */

const { test, expect } = require('../../fixtures/pages.fixture');

test.describe('Transfer UI', () => {
  test('transfer form shows account dropdowns populated from the server', async ({ transferPage }) => {
    // WHY UI: Account dropdowns are populated via JavaScript after an AJAX
    // call. Only a browser can verify that the JS ran and the options rendered.
    await transferPage.open();

    const fromOptions = transferPage.page.locator('#fromAccountId option');
    const toOptions = transferPage.page.locator('#toAccountId option');

    await expect(fromOptions).not.toHaveCount(0);
    await expect(toOptions).not.toHaveCount(0);
  });

  test('successful transfer shows the Transfer Complete confirmation', async ({ transferPage }) => {
    // WHY UI: The confirmation div is shown/hidden by JavaScript after the
    // AJAX response. This is visual feedback — the only way to assert it
    // appeared is through a browser watching the DOM change.
    await transferPage.open();

    // TransferBuilder is the right tool when you have known account IDs (see API tests).
    // Here the from/to accounts come from the page's pre-selected dropdown values,
    // so we pass the amount directly — the Builder would add no value over the noise.
    await transferPage.transfer({ amount: 1 });

    const confirmation = await transferPage.getConfirmationText();
    expect(confirmation).toContain('Transfer Complete!');
  });
});
