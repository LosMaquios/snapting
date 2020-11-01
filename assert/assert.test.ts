import { asserts } from "../deps.ts";
import { assertSnapshot } from "../assert/assert.ts";
import { createSnapshotRunner } from "../runner/runner.ts";

const test = createSnapshotRunner(import.meta.url);

test("should work with primitive types", () => {
  // Assert: number
  assertSnapshot(123, "works with integers");
  assertSnapshot(123.456, "works with floats");
  // TODO: assertSnapshot(123n ** 4567890n, "works with bigints");

  // Assert: string
  assertSnapshot("some string", "works with strings");

  // Assert: boolean
  assertSnapshot(true, "works with true");
  assertSnapshot(false, "works with false");

  // Assert: null
  assertSnapshot(null);
});

test("should work with complex types", () => {
  // Assert: object
  assertSnapshot({
    int: 123,
    float: 123.456,
    string: "some string",
    truthy: true,
    falsy: false,
    nullish: null,
    object: {
      key: "value",
    },
    array: [
      "element",
    ],
  }, "works with object");

  // Assert: Array
  assertSnapshot([
    123,
    123.456,
    "some string",
    true,
    false,
    null,
    {
      key: "value",
    },
    [
      "element",
    ],
  ], "works with arrays");

  // TODO: assertSnapshot(function fn() {}, "works with function")
  // TODO: assertSnapshot(/[a-z]+/i, "works with regex")
});

Deno.test("should throw on invalid `assertSnapshot` call", () => {
  try {
    assertSnapshot("Something wrong!");
    asserts.assert(false);
  } catch (error) {
    asserts.assert(error instanceof Error);
    asserts.assert(
      error.message === "`assertSnapshot` must be called within a test runner",
    );
  }
});
