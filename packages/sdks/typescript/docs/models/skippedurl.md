# SkippedUrl

## Example Usage

```typescript
import { SkippedUrl } from "@deepcrawl-sdk/ts";

let value: SkippedUrl = {
  url: "https://example.com/private-page",
  reason: "Blocked by robots.txt",
};
```

## Fields

| Field                                      | Type                                       | Required                                   | Description                                | Example                                    |
| ------------------------------------------ | ------------------------------------------ | ------------------------------------------ | ------------------------------------------ | ------------------------------------------ |
| `url`                                      | *string*                                   | :heavy_check_mark:                         | The URL that was skipped during processing | https://example.com/private-page           |
| `reason`                                   | *string*                                   | :heavy_check_mark:                         | The reason why this URL was skipped        | Blocked by robots.txt                      |