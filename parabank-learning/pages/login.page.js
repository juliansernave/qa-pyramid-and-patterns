const { BasePage } = require('./base.page');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    // Login form lives on index.htm — login.htm is only the POST target
    this.url = '/parabank/index.htm';
  }

  async loginAs({ username, password }) {
    await this.goto(this.url);
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('input[type="submit"]');
  }

  async getErrorMessage() {
    return this.page.textContent('p.error');
  }

  isOnErrorPage() {
    return this.page.url().includes('login.htm');
  }
}

module.exports = { LoginPage };
