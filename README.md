# Snapting

  Very simple snapshot testing for Deno

## Usage

```ts
import { createAssertSnaphost } from "https://denopkg.com/LosMaquios/snapting/mod.ts";

const assertSnapshot = createAssertSnaphost(import.meta.url);

Deno.test('should work', () => {
  assertSnapshot('testing snapshot');
})
```
