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
    private _snapshotFilename: string,
  ) {
    this._appendHeader();
  }

  /**
   * 
   * @param id 
   * @param assertion 
   */
  appendAssertion(id: string, assertion: string) {
    this._snapshotBuffer.push(
      `${SnapshotWriter.ASSERTIONS_CONST_NAME}["${id}"] = ${assertion};`,
    );
  }

  /**
   *
   */
  write() {
    console.log('Writing to:', this._snapshotFilename.replace('file://', ''));

    return Deno.writeTextFile(
      this._snapshotFilename.replace('file://', ''),
      this._genSnapshotCode(),
      {
        mode: 0o777,
      },
    );
  }

  /**
   * 
   */
  private _genSnapshotCode() {
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
