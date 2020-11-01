import type { SnapshotManager } from "../manager/manager.ts";
import { snapshotBatchInstance } from "./batch.ts";

export type SnapshotFileAssertions = { assertions: Record<string, any> };
export type SnapshotFileBuffer = string[];

export class SnapshotWriter {
  /**
   * 
   */
  static ASSERTIONS_CONST_NAME = "assertions";

  /**
   * 
   */
  private _snapshotBuffer: SnapshotFileBuffer = [];

  constructor(
    private _snapshotManager: SnapshotManager,
  ) {
    // Auto-batching
    snapshotBatchInstance.add(this);

    this._appendHeader();
  }

  /**
   *
   */
  write() {
    const fixPath = this._snapshotManager.snapshotFilename.replace(
      "file://",
      "",
    );

    return Deno.writeTextFileSync(
      fixPath,
      this._genSnapshotCode(),
      {
        mode: 0o777,
      },
    );
  }

  /**
   *
   */
  private _appendCases() {
    this._snapshotManager.eachCase((caseId, kase) => {
      kase.eachAssertion((assertionId, assertion) => {
        this._appendAssertion(
          `${caseId} ${assertionId}`,
          JSON.stringify(assertion, null, 2),
        );
      });
    });
  }

  /**
   * 
   * @param id 
   * @param assertion 
   */
  private _appendAssertion(id: string, assertion: string) {
    this._snapshotBuffer.push(
      `${SnapshotWriter.ASSERTIONS_CONST_NAME}["${id}"] = ${assertion};`,
    );
  }

  /**
   * 
   */
  private _genSnapshotCode() {
    this._appendCases();

    const code = this._snapshotBuffer.join("\n\n");

    this._resetBuffer();
    return code;
  }

  /**
   * 
   */
  private _resetBuffer() {
    this._snapshotBuffer.length = 0;
    this._appendHeader();
  }

  /**
   * 
   */
  private _appendHeader() {
    this._snapshotBuffer.push(
      `export const ${SnapshotWriter.ASSERTIONS_CONST_NAME} = {};`,
    );
  }
}
