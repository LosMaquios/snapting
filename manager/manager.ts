import { SnapshotCase } from "../case/case.ts";
import {
  SNAPSHOT_FILE_ASSERTION_ID_REGEX,
  SnapshotFileAssertions,
  SnapshotWriter,
} from "../writer/writer.ts";

export type SnapshotCaseId = string;
export type SnapshotCaseMap = Map<SnapshotCaseId, SnapshotCase>;

export class SnapshotManager extends SnapshotWriter {
  /**
   * 
   */
  private _snapshotCases: SnapshotCaseMap = new Map();

  /**
   * 
   */
  private _resolvedSnapshotFile = false;

  /**
   * 
   */
  hasValidSnapshotFile = false;

  /**
   * 
   * @param caseId 
   */
  getCase(caseId: SnapshotCaseId) {
    let resultCase = this._snapshotCases.get(caseId);

    if (!resultCase) {
      this._snapshotCases.set(
        caseId,
        resultCase = new SnapshotCase(caseId, this),
      );
    }

    return resultCase;
  }

  /**
   * IMPORTANT! Should be called before any call to `getCase` method
   */
  async resolveSnapshotFile() {
    if (this._resolvedSnapshotFile) {
      return;
    }

    let snapshotFile: SnapshotFileAssertions | null = null;

    try {
      snapshotFile = await import(this.snapshotFilename);
      this.hasValidSnapshotFile = true;
    } catch (error) {
      // TODO
      console.error(error);
    }

    if (snapshotFile) {
      const { assertions } = snapshotFile;
      const ids = Object.keys(assertions);

      for (const id of ids) {
        const match = SNAPSHOT_FILE_ASSERTION_ID_REGEX.exec(id);

        if (!match || !match.groups) {
          throw new Error(
            `[MISMATCH] Invalid snapshot file assertion id: ${id}`,
          );
        }

        const { groups: { caseId, assertionId } } = match;

        const resultCase = this.getCase(caseId);
        const assertion = assertions[id];

        resultCase.addAssertion(
          parseInt(assertionId),
          assertion,
          true,
        );
      }
    }

    this._resolvedSnapshotFile = true;
  }
}
