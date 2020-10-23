import * as path from "https://deno.land/std@0.74.0/path/mod.ts";
import { AssertionError } from "https://deno.land/std@0.74.0/testing/asserts.ts";

export type SnapshotId = number;
export type SnapshotTestMap = Map<SnapshotId, any>;

export class SnapshotManager {
  /**
   * 
   */
  private _snapshotTests: SnapshotTestMap = new Map();

  /**
   * 
   */
  private _currentSnapshotTestId: SnapshotId = 0;

  /**
   * 
   */
  private _snapshotFilename: string = "";

  /**
   * 
   */
  private _resolvedSnapshots = false;

  /**
   * 
   * @param _parentURL 
   */
  constructor(
    private _parentURL: string,
  ) {}

  /**
   * 
   * @param expected 
   * @param message 
   */
  async expect(expected: unknown, message = "") {
    await this._resolveSnapshots();

    const snapshotTestId = this._currentSnapshotTestId++;

    if (!this._snapshotTests.has(snapshotTestId)) {
      this._snapshotTests.set(
        snapshotTestId,
        expected,
      );

      return this._writeSnapshots();
    }

    const value = JSON.parse(
      this._snapshotTests.get(snapshotTestId)!,
    );

    if (expected !== value) {
      throw new AssertionError(message);
    }
  }

  /**
   * 
   */
  private async _resolveSnapshots() {
    if (this._resolvedSnapshots) {
      return;
    }

    this._snapshotFilename = path.join(
      path.dirname(this._parentURL),
      `.snapshots/${path.basename(this._parentURL)}`,
    );

    let module: { default: SnapshotTestMap };
  
    try {
      module = await import(this._snapshotFilename);

      this._snapshotTests = module.default;
    } catch (error) {
      // console.error(error);
    }

    this._resolvedSnapshots = true;
  }

  /**
   * 
   */
  private _writeSnapshots() {
    let code = "const snapshotTests = new Map();";

    for (const [snapshotTestId, snapshotTestValue] of this._snapshotTests) {
      code += `\n\nmap.set(${snapshotTestId}, ${
        JSON.stringify(snapshotTestValue, null, 2)
      });`;
    }

    Deno.mkdirSync(path.dirname(this._snapshotFilename), { recursive: true });

    code += "\n\nexport default snapshotTests;";
/*
    return Deno.writeTextFile(
      this._snapshotFilename,
      code,
    );*/
  }
}
