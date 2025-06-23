# SkippedLinks

## Example Usage

```typescript
import { SkippedLinks } from "@deepcrawl-sdk/ts";

let value: SkippedLinks = {
  internal: [
    {
      url: "https://example.com/admin",
      reason: "Blocked by robots.txt",
    },
    {
      url: "https://example.com/private",
      reason: "Requires authentication",
    },
  ],
  external: [
    {
      url: "https://external-site.com/blocked",
      reason: "External domain excluded",
    },
  ],
  media: {
    images: [
      {
        url: "https://example.com/large-image.jpg",
        reason: "File size exceeds limit",
      },
    ],
    videos: [
      {
        url: "https://example.com/video.mp4",
        reason: "Media extraction disabled",
      },
    ],
    documents: [
      {
        url: "https://example.com/document.pdf",
        reason: "PDF processing disabled",
      },
    ],
  },
  other: [
    {
      url: "mailto:contact@example.com",
      reason: "Non-HTTP protocol",
    },
  ],
};
```

## Fields

| Field                                                      | Type                                                       | Required                                                   | Description                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `internal`                                                 | [models.SkippedUrl](../models/skippedurl.md)[]             | :heavy_minus_sign:                                         | Internal URLs that were skipped during processing          |
| `external`                                                 | [models.SkippedUrl](../models/skippedurl.md)[]             | :heavy_minus_sign:                                         | External URLs that were skipped during processing          |
| `media`                                                    | [models.SkippedLinksMedia](../models/skippedlinksmedia.md) | :heavy_minus_sign:                                         | Media URLs that were skipped during processing             |
| `other`                                                    | [models.SkippedUrl](../models/skippedurl.md)[]             | :heavy_minus_sign:                                         | Other URLs that were skipped during processing             |