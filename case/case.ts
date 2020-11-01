import type { SnapshotManager } from "../manager/manager.ts";
import { asserts } from "../deps.ts";

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
  private _pendingSnapshotAssertions: SnapshotAssertionMap = new Map();

  constructor(
    public caseId: string,
    private _snapshotManager: SnapshotManager,
  ) {}

  /**
   * 
   * @param assertionId - the assertion id
   * @param assertion - the assertion value
   * @param pending
   */
  addAssertion(
    assertionId: SnapshotAssertionId,
    assertion: any,
    pending = false,
  ) {
    this._snapshotAssertions.set(assertionId, assertion);

    if (pending) {
      this._pendingSnapshotAssertions.set(assertionId, assertion);
    } else {
      // Append unknown assertion to writer buffer
      this._snapshotManager.appendAssertion(
        this.caseId,
        assertionId,
        assertion,
      );
    }
  }

  /**
   * 
   * @param assertion 
   * @param message 
   */
  assert(assertion: any, message: string) {
    const assertionId = this._currentSnapshotAssertionId++;
    const expected = this._snapshotAssertions.get(assertionId);
    const { hasValidSnapshotFile } = this._snapshotManager;

    if (!this._snapshotAssertions.has(assertionId)) {
      if (hasValidSnapshotFile) {
        throw new asserts.AssertionError(
          `Missing assertion in snapshot file${message ? `: ${message}` : "."}`,
        );
      }

      return this.addAssertion(assertionId, assertion);
    }

    asserts.assertEquals(assertion, expected, message);

    if (hasValidSnapshotFile) {
      this._pendingSnapshotAssertions.delete(assertionId);
    }
  }

  /**
   * 
   */
  validatePendingAssertions() {
    if (this._pendingSnapshotAssertions.size) {
      throw new asserts.AssertionError(
        "[MISMATCH] Snapshot file has pending assertions.",
      );
    }
  }
}
