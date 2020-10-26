import { assertSnapshot } from "../assert/assert.ts";
import { createSnapshotRunner } from "../runner/runner.ts";

const test = createSnapshotRunner(import.meta.url);

test("should work", () => {
  assertSnapshot("Testing snapshots");
});

test("this should be working now", () => {
  assertSnapshot("C'mon");
  assertSnapshot("What?");
});
