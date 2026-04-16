/**
 * BUILDER PATTERN
 *
 * Problem it solves:
 *   A transfer has several fields (from, to, amount) and they're all required.
 *   If you pass them as positional arguments — transfer(12345, 12456, 10) — it's
 *   easy to mix up the order and hard to read in test output. If you use a plain
 *   object literal every time, you have no place to put validation. The Builder
 *   gives you a readable chainable API AND a single place to enforce invariants
 *   before the object is used.
 *
 * When to use it:
 *   - An object has many fields, especially optional ones
 *   - You want to validate the object is complete before it's used
 *   - You want tests to read like sentences: .from(A).to(B).amount(10)
 *
 * When it's overkill:
 *   - The object has 1-2 fields — a plain object literal is cleaner
 *   - You never need partial construction (all fields always known upfront)
 *
 * How it applies here:
 *   Transfer tests call TransferBuilder to construct params. The build() method
 *   validates that both accounts are set, catching mistakes like forgetting .to()
 *   before the test even hits the network.
 */

class TransferBuilder {
  constructor() {
    this._from = null;
    this._to = null;
    this._amount = null;
  }

  /** Account ID to transfer FROM */
  from(accountId) {
    this._from = accountId;
    return this;
  }

  /** Account ID to transfer TO */
  to(accountId) {
    this._to = accountId;
    return this;
  }

  /** Dollar amount to transfer */
  amount(value) {
    this._amount = value;
    return this;
  }

  /**
   * Validates and returns the transfer params object.
   * Throws if required fields are missing so the error surfaces at build time,
   * not buried in a network response.
   */
  build() {
    if (this._from === null) throw new Error('TransferBuilder: .from(accountId) is required');
    if (this._to === null) throw new Error('TransferBuilder: .to(accountId) is required');
    if (this._amount === null) throw new Error('TransferBuilder: .amount(value) is required');
    if (this._amount <= 0) throw new Error('TransferBuilder: amount must be greater than 0');
    if (this._from === this._to) throw new Error('TransferBuilder: from and to accounts must differ');

    return {
      fromAccountId: this._from,
      toAccountId: this._to,
      amount: this._amount,
    };
  }
}

module.exports = { TransferBuilder };
