import { SnapshotManager } from "./manager.ts";

/**
 * 
 * 
 * @param importURL 
 */
export function createAssertSnapshot(importURL: string) {
  const snapshotManager = new SnapshotManager(
    importURL,
  );

  return function assertSnapshot(expected: unknown, message = "") {
    return snapshotManager.expect(expected, message);
  };
}
