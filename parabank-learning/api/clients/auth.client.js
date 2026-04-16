/**
 * Thin wrapper around ParaBank's login endpoint.
 * Keeps URL construction and header boilerplate out of test files.
 */
class AuthClient {
  constructor(request) {
    this._request = request;
  }

  async login(username, password) {
    const response = await this._request.get(
      `/parabank/services/bank/login/${username}/${password}`,
      { headers: { Accept: 'application/json' } }
    );
    return { status: response.status(), body: await response.text() };
  }
}

module.exports = { AuthClient };
