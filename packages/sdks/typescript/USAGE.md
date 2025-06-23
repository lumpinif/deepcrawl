<!-- Start SDK Example Usage [usage] -->
```typescript
import { DeepcrawlApp } from "@deepcrawl-sdk/ts";

const deepcrawlApp = new DeepcrawlApp();

async function run() {
  const result = await deepcrawlApp.deepcrawl.getApiInfo();

  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->