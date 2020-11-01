import { path } from "../deps.ts";
import type { SnapshotAssertionId } from "../case/case.ts";
import type { SnapshotCaseId } from "../manager/manager.ts";
import { snapshotBatchInstance } from "./batch.ts";

export type SnapshotFileAssertions = { assertions: Record<string, any> };
export type SnapshotFileBuffer = string[];

export const SNAPSHOT_FILE_ASSERTION_ID_REGEX =
  /^(?<caseId>[\s\S]+) (?<assertionId>\d+)$/;

export class SnapshotWriter {
  /**
   * 
   */
  static ASSERTIONS_CONST_NAME = "assertions";

  /**
   * 
   */
  private _snapshotBuffer: SnapshotFileBuffer = [];

  /**
   * 
   */
  get pendingWrite() {
    return !!this._snapshotBuffer.length;
  }

  /**
   * 
   */
  get snapshotFilename() {
    const snapshotFileURL = new URL(
      `./${path.basename(this._parentURL)}.snap`,
      this._parentURL,
    );

    const fixPath = String(snapshotFileURL).replace(
      /^file:\/\//,
      "",
    );

    return fixPath;
  }

  constructor(
    private _parentURL: string,
  ) {
    // Auto-batching
    snapshotBatchInstance.add(this);
  }

  appendAssertion(
    caseId: SnapshotCaseId,
    assertionId: SnapshotAssertionId,
    assertion: any,
  ) {
    const serializedId = `${caseId} ${assertionId}`;
    const stringifiedAssertion = JSON.stringify(assertion, null, 2);

    this._snapshotBuffer.push(
      `${SnapshotWriter.ASSERTIONS_CONST_NAME}["${serializedId}"] = ${stringifiedAssertion};`,
    );
  }

  /**
   *
   */
  write() {
    const generatedCode = this._generateSnapshotCode();
    const writeOptions: Deno.WriteFileOptions = {
      mode: 0o777,
    };

    return Deno.writeTextFileSync(
      this.snapshotFilename,
      generatedCode,
      writeOptions,
    );
  }

  /**
   * 
   */
  private _generateSnapshotCode() {
    this._prependHeader();

    const code = this._snapshotBuffer.join("\n\n");

    this._resetBuffer();
    return code;
  }

  /**
   * 
   */
  private _resetBuffer() {
    this._snapshotBuffer.length = 0;
  }

  /**
   * 
   */
  private _prependHeader() {
    this._snapshotBuffer.unshift(
      `export const ${SnapshotWriter.ASSERTIONS_CONST_NAME} = {};`,
    );
  }
}
