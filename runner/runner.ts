import { SnapshotManager } from "../manager/manager.ts";
import type { SnapshotCase } from "../case/case.ts";

const managerCache = new Map<string, SnapshotManager>();

let currentSnapshotCase: SnapshotCase | null;

export function getCurrentSnapshotCase() {
  return currentSnapshotCase;
}

export function createSnapshotRunner(importURL: string) {
  return function snapshotRunner(...args: any[]) {
    let testDefinition: Deno.TestDefinition = args[0];

    if (typeof args[0] !== "object") {
      testDefinition = {
        name: args[0],
        fn: args[1],
      };
    }

    const { fn } = testDefinition;
    let snapshotManager = managerCache.get(importURL)!;

    if (!snapshotManager) {
      managerCache.set(
        importURL,
        snapshotManager = new SnapshotManager(importURL),
      );
    }

    // Patch test fn
    testDefinition.fn = async (...args) => {
      await snapshotManager.resolveSnapshotFile();

      currentSnapshotCase = snapshotManager.getCase(testDefinition.name);
      await fn(...args);

      currentSnapshotCase.validatePendingAssertions();
      currentSnapshotCase = null;
    };

    // Attach patched test fn
    Deno.test(testDefinition);
  } as typeof Deno["test"];
}
