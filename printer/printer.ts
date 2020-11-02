/**
 * Basic pretty-format printer
 * 
 * Inspired by: https://github.com/facebook/jest/tree/master/packages/pretty-format
 */
import { getConstructorName, toISOString } from "./printer_utils.ts";

const DENO_FN_FORMAT_INDENTATION_SIZE = 4;

const INDENTATION_SIZE = 2;
const NEWLINE_REGEX = /\r?\n/g;

export class Printer {
  constructor(
    public indentationSize = INDENTATION_SIZE,
    /**
     * @private
     */
    private _skipFirstLineIdentation = false,
    /**
     * @private
     */
    private _seen = new WeakSet(),
  ) {}

  /**
   * 
   * @param arr 
   */
  printArray(arr: any[] | ArrayLike<any>) {
    this._seen.add(arr);

    const isArrayLike = !Array.isArray(arr);
    const { length } = arr;

    let result = `${isArrayLike ? "Array" : getConstructorName(arr, "Array")}${
      isArrayLike ? "Like" : ""
    } [\n`;

    const valuePrinter = new Printer(this.indentationSize, false, this._seen);

    for (let i = 0; i < length; i++) {
      result += valuePrinter.print(arr[i]);
      result += ",\n";
    }

    return `${result}]`;
  }

  /**
   * 
   * @param bigint 
   */
  printBigInt(bigint: BigInt) {
    return `${bigint}n`;
  }

  /**
   * 
   * @param bool 
   */
  printBoolean(bool: boolean) {
    return String(bool);
  }

  /**
   * 
   */
  printCircularRef() {
    return "[Circular]";
  }

  /**
   * 
   * @param date 
   */
  printDate(date: Date) {
    return `${getConstructorName(date, "Date")} { ${toISOString.call(date)} }`;
  }

  /**
   * 
   * @param fn 
   */
  printFunction(fn: (...args: any[]) => any) {
    const fnStr = String(fn);
    const fnLines = fnStr.split(NEWLINE_REGEX);
    const { length } = fnLines;

    if (length === 1) {
      return fnStr;
    }

    let extraIndentationCount = 0;
    const lastLineIndex = length - 1;

    // Trim whitespaces from last line
    fnLines[lastLineIndex] = fnLines[lastLineIndex].replace(/^ +/, (ws) => {
      extraIndentationCount = ws.length;
      return "";
    });

    if (length > 2) {
      const trimStartRegex = new RegExp(`^ {${extraIndentationCount},}`);

      for (let n = 1; n < lastLineIndex; n++) {
        fnLines[n] = fnLines[n].replace(trimStartRegex, ({ length }) => {
          const leftLength = length - extraIndentationCount;

          return " ".repeat(
            this.indentationSize * leftLength / DENO_FN_FORMAT_INDENTATION_SIZE,
          );
        });
      }
    }

    return fnLines.join("\n");
  }

  /**
   * 
   * @param iterable 
   */
  printIterable(iterable: Iterable<any>) {
    let result = "Iterable {\n";

    let item: IteratorResult<any>;
    const iterator = iterable[Symbol.iterator]();
    const valuePrinter = new Printer(this.indentationSize, false, this._seen);

    while (!(item = iterator.next()).done) {
      result += valuePrinter.print(item.value);
      result += ",\n";
    }

    return `${result}}`;
  }

  /**
   * 
   * @param num 
   */
  printNumber(num: number) {
    return String(num);
  }

  /**
   * 
   */
  printNull() {
    return "null";
  }

  /**
   * 
   * @param map 
   */
  printMap(map: Map<any, any>) {
    this._seen.add(map);

    let result = `${getConstructorName(map, "Map")} {\n`;

    const keyPrinter = new Printer(this.indentationSize, false, this._seen);
    const valuePrinter = new Printer(this.indentationSize, true, this._seen);

    for (const [key, value] of map) {
      result += [
        keyPrinter.print(key),
        " => ",
        valuePrinter.print(value),
      ].join("");

      result += ",\n";
    }

    return `${result}}`;
  }

  /**
   * 
   * @param obj 
   */
  printObject(obj: Record<any, any>) {
    this._seen.add(obj);

    let result = `${getConstructorName(obj, "Object")} {\n`;

    const keys = Object.keys(obj);
    const keyPrinter = new Printer(this.indentationSize, false, this._seen);
    const valuePrinter = new Printer(this.indentationSize, true);

    for (const key of keys) {
      result += [
        keyPrinter.print(key),
        ": ",
        valuePrinter.print(obj[key]),
      ].join("");

      result += ",\n";
    }

    return `${result}}`;
  }

  /**
   * 
   * @param regex 
   */
  printRegExp(regex: RegExp) {
    return String(regex);
  }

  printSet(set: Set<any>) {
    this._seen.add(set);

    let result = `${getConstructorName(set, "Set")} {\n`;

    const valuePrinter = new Printer(this.indentationSize, false, this._seen);

    for (const value of set) {
      result += valuePrinter.print(value);
      result += ",\n";
    }

    return `${result}}`;
  }

  /**
   * 
   * @param str 
   */
  printString(str: string) {
    return `"${str}"`;
  }

  /**
   * 
   * @param sym 
   */
  printSymbol(sym: symbol) {
    return String(sym);
  }

  /**
   * 
   */
  printUndefined() {
    return "undefined";
  }

  /**
   * 
   * @param value 
   */
  print(value: any): string {
    const type = typeof value;
    const result = ((): string => {
      switch (type) {
        case "bigint":
          return this.printBigInt(value);
        case "boolean":
          return this.printBoolean(value);
        case "function":
          return this.printFunction(value);
        case "number":
          return this.printNumber(value);
        case "string":
          return this.printString(value);
        case "symbol":
          return this.printSymbol(value);
        case "undefined":
          return this.printUndefined();
        case "object": {
          if (value === null) {
            return this.printNull();
          }

          if (this._seen.has(value)) {
            return this.printCircularRef();
          }

          if (value instanceof RegExp) {
            return this.printRegExp(value);
          }

          if (value instanceof Date) {
            return this.printDate(value);
          }

          if ("length" in value) {
            return this.printArray(value);
          }

          if (value instanceof Map) {
            return this.printMap(value);
          }

          if (value instanceof Set) {
            return this.printSet(value);
          }

          if (typeof value[Symbol.iterator] === "function") {
            return this.printIterable(value);
          }

          return this.printObject(value);
        }
      }
    })();

    return this._printWithIdentation(result);
  }

  private _printWithIdentation(value: string) {
    const lines = value.split(NEWLINE_REGEX);
    const indentedLines: string[] = [];

    if (this._skipFirstLineIdentation) {
      indentedLines.push(lines[0]);
    }

    for (let n = this._skipFirstLineIdentation ? 1 : 0; n < lines.length; n++) {
      indentedLines.push(`${" ".repeat(this.indentationSize)}${lines[n]}`);
    }

    return indentedLines.join("\n");
  }
}
