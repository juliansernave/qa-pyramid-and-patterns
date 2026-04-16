const { BasePage } = require('./base.page');

class TransferPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/parabank/transfer.htm';
  }

  async open() {
    await this.goto(this.url);
    // 'option' elements inside a select aren't "visible" in Playwright's sense —
    // use 'attached' so we wait for them to exist in the DOM, not to be visible
    await this.page.waitForSelector('#fromAccountId option', { state: 'attached' });
  }

  async transfer({ amount }) {
    await this.page.fill('#amount', String(amount));
    // Default selects already have the first account pre-selected — use those
    await this.page.click('input[value="Transfer"]');
    // Result is shown/hidden via JS, not a page navigation
    await this.page.waitForSelector('#showResult', { state: 'visible' });
  }

  async getConfirmationText() {
    return this.page.textContent('#showResult');
  }

  async getErrorText() {
    return this.page.textContent('#showError');
  }
}

module.exports = { TransferPage };
