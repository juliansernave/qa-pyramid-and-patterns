/**
 * Encapsulates all account-related ParaBank API calls.
 * Tests import this class instead of constructing URLs and headers inline.
 */
class AccountsClient {
  constructor(request) {
    this._request = request;
  }

  async getAccounts(customerId) {
    const response = await this._request.get(
      `/parabank/services/bank/customers/${customerId}/accounts`,
      { headers: { Accept: 'application/json' } }
    );
    return { status: response.status(), body: await response.text() };
  }

  async createAccount(customerId, newAccountType, fromAccountId) {
    const response = await this._request.post(
      `/parabank/services/bank/createAccount`,
      {
        params: { customerId, newAccountType, fromAccountId },
        headers: { Accept: 'application/json' },
      }
    );
    return { status: response.status(), body: await response.text() };
  }

  async transfer(fromAccountId, toAccountId, amount) {
    const response = await this._request.post(
      `/parabank/services/bank/transfer`,
      {
        params: { fromAccountId, toAccountId, amount },
        headers: { Accept: 'application/json' },
      }
    );
    return { status: response.status(), body: await response.text() };
  }
}

module.exports = { AccountsClient };
