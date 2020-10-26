# Snapting

  Very simple snapshot testing for Deno

## Usage

```ts
import { createS, assertSnapshot } from "https://denopkg.com/LosMaquios/snapting/mod.ts";

Deno.test('should work', async () => {
  await assertSnapshot('testing snapshot');
})
```
