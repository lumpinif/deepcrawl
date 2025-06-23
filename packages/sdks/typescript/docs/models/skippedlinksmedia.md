# SkippedLinksMedia

Media URLs that were skipped during processing

## Example Usage

```typescript
import { SkippedLinksMedia } from "@deepcrawl-sdk/ts";

let value: SkippedLinksMedia = {
  images: [
    {
      url: "https://example.com/private-page",
      reason: "Blocked by robots.txt",
    },
  ],
  videos: [
    {
      url: "https://example.com/private-page",
      reason: "Blocked by robots.txt",
    },
  ],
  documents: [
    {
      url: "https://example.com/private-page",
      reason: "Blocked by robots.txt",
    },
  ],
};
```

## Fields

| Field                                             | Type                                              | Required                                          | Description                                       |
| ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| `images`                                          | [models.SkippedUrl](../models/skippedurl.md)[]    | :heavy_minus_sign:                                | Image URLs that were skipped during processing    |
| `videos`                                          | [models.SkippedUrl](../models/skippedurl.md)[]    | :heavy_minus_sign:                                | Video URLs that were skipped during processing    |
| `documents`                                       | [models.SkippedUrl](../models/skippedurl.md)[]    | :heavy_minus_sign:                                | Document URLs that were skipped during processing |