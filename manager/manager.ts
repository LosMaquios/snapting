import * as path from "https://deno.land/std@0.74.0/path/mod.ts";

import { SnapshotCase } from "../case/case.ts";
import { SnapshotFileAssertions, SnapshotWriter } from "../writer/writer.ts";

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
  private get _snapshotFilename() {
    return new URL(
      `./${path.basename(this._parentURL)}.snap`,
      this._parentURL,
    ).toString();
  }

  /**
   * 
   */
  private _snapshotWriter = new SnapshotWriter(this._snapshotFilename);

  /**
   * 
   * @param _parentURL 
   */
  constructor(
    private _parentURL: string,
  ) {}

  /**
   * 
   * @param caseId 
   */
  getCase(caseId: SnapshotCaseId) {
    let resultCase = this._snapshotCases.get(caseId);

    if (!resultCase) {
      this._snapshotCases.set(
        caseId,
        resultCase = new SnapshotCase(caseId, this._writeSnapshotFile),
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
      snapshotFile = await import(this._snapshotFilename);
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
        );
      }
    }

    this._resolvedSnapshotFile = true;
  }

  /**
   *
   */
  private _writeSnapshotFile = () => {
    let needRewrite = false;

    for (const [caseId, kase] of this._snapshotCases) {
      if (kase.pendingUpdates) {
        needRewrite = true;
      }

      kase.eachAssertion((assertionId, assertion) => {
        this._snapshotWriter.appendAssertion(
          `${caseId} ${assertionId}`,
          JSON.stringify(assertion, null, 2),
        );
      });
    }

    return needRewrite
      ? this._snapshotWriter.write()
      : Promise.resolve();
  };
}
