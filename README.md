# Snapting (WIP)

  Very simple snapshot testing for Deno

## Usage

```ts
import { createSnapshotRunner, assertSnapshot } from "https://denopkg.com/LosMaquios/snapting/mod.ts";

const test = createSnapshotRunner(import.meta.url);

test('should work', () => {
  assertSnapshot('testing snapshot');
})
```
