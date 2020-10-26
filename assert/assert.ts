import { getCurrentSnapshotCase } from "../runner/runner.ts";

export function assertSnapshot(expected: unknown, message = "") {
  const currentSnapshotCase = getCurrentSnapshotCase();

  if (!currentSnapshotCase) {
    throw new Error("`assertSnapshot` must be called within a test runner");
  }

  return currentSnapshotCase.assert(expected, message);
}
