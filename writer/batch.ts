import type { SnapshotWriter } from "./writer.ts";

export class SnapshotBatch extends Set<SnapshotWriter> {
  /**
   * 
   */
  commit() {
    // Perform writes sequentially
    for (const writer of this) {
      writer.write();
    }

    // Empty queue
    this.clear();
  }
}

export const snapshotBatchInstance = new SnapshotBatch();

addEventListener("unload", () => {
  // Commit batch during script unload
  snapshotBatchInstance.commit();
});
