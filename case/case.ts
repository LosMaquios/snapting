import { assertEquals } from "https://deno.land/std@0.74.0/testing/asserts.ts";

export type SnapshotAssertionId = number;
export type SnapshotAssertionMap = Map<SnapshotAssertionId, any>;

export class SnapshotCase {
  /**
   * 
   */
  private _currentSnapshotAssertionId: SnapshotAssertionId = 0;

  /**
   * 
   */
  private _snapshotAssertions: SnapshotAssertionMap = new Map();

  /**
   * 
   */
  pendingUpdates = false;

  constructor(
    public caseId: string,
    private _endCb: () => Promise<void>,
  ) {}

  /**
   * 
   * @param assertion 
   */
  addAssertion(assertionId: SnapshotAssertionId, assertion: any) {
    this._snapshotAssertions.set(assertionId, assertion);
  }

  /**
   * 
   * @param assertion 
   * @param message 
   */
  assert(assertion: any, message: string) {
    const assertionId = this._currentSnapshotAssertionId++;
    const expected = this._snapshotAssertions.get(assertionId);

    if (!this._snapshotAssertions.has(assertionId)) {
      this.pendingUpdates = true;
      return this.addAssertion(assertionId, assertion);
    }

    assertEquals(assertion, expected, message);
  }

  /**
   * 
   * @param iterator 
   */
  eachAssertion(
    iterator: (assertionId: SnapshotAssertionId, assertion: any) => void,
  ) {
    for (const [assertionId, assertion] of this._snapshotAssertions) {
      iterator(assertionId, assertion);
    }
  }

  /**
   * 
   */
  end() {
    return this._endCb();
  }
}
