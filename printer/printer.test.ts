import { asserts } from "../deps.ts";
import { Printer } from "./printer.ts";

Deno.test("should print correctly", () => {
  const printer = new Printer();

  class ExtendedSet extends Set {}

  const test = {
    regex: /a+/gi,
    extendedSet: new ExtendedSet(["test", "set"]),
    map: new Map([["hi", ["a", "b"]]]),
    set: new Set([
      {
        key: "value",
        date: new Date(),
      },
    ]),
    arrayLike: {
      0: "Hi",
      length: 1,
    },
    fn: function b() {
      console.log("a");

      if (typeof (window as any).b !== "string") {
        return function c() {
          console.log("c");
        };
      }
    },
    a: "test",
  };

  console.log(`\`\n${printer.print(test)}\n\``);

  asserts.assert(true);
});
