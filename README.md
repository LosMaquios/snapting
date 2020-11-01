# Snapting (WIP)

  Very simple snapshot testing for Deno

## Usage

```ts
import { createSnapshotRunner, assertSnapshot } from "https://denopkg.com/LosMaquios/snapting/mod.ts";

const test = createSnapshotRunner(import.meta.url);

test("should work", () => {
  assertSnapshot("testing snapshot");
});
```

## Development

  I'm currently working on `Windows 10` using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10). I couldn't get this to work without using WSL so the lib seems that only can be developed and supported on `unix-like` systems.
