import { path } from "../deps.ts";
import { SnapshotCase } from "../case/case.ts";
import { SnapshotFileAssertions, SnapshotWriter } from "../writer/writer.ts";
import { iterateMap, IteratorFn } from "../utils.ts";

export type SnapshotCaseId = string;
export type SnapshotCaseMap = Map<SnapshotCaseId, SnapshotCase>;

export class SnapshotManager {
  /**
   * 
   */
  static EXTRACT_CASE_AND_ASSERTION_ID_REGEX = /^([\s\S]+) (\d+)$/;

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
   */
  snapshotFilename = new URL(
    `./${path.basename(this._parentURL)}.snap`,
    this._parentURL,
  ).toString();

  /**
   * 
   * @param _parentURL 
   */
  constructor(
    private _parentURL: string,
  ) {
    new SnapshotWriter(this);
  }

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
        // TODO: Check `id` integrity
        const [, caseId, assertionId] = SnapshotManager
          .EXTRACT_CASE_AND_ASSERTION_ID_REGEX.exec(id)!;

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

  eachCase(
    iterator: IteratorFn<SnapshotCaseId, SnapshotCase>,
  ) {
    iterateMap(this._snapshotCases, iterator);
  }
}
