# ExtractedLinks

## Example Usage

```typescript
import { ExtractedLinks } from "@deepcrawl-sdk/ts";

let value: ExtractedLinks = {
  internal: [
    "https://example.com/about",
    "https://example.com/contact",
    "https://example.com/services",
  ],
  external: [
    "https://github.com/example/repo",
    "https://twitter.com/example",
    "https://linkedin.com/company/example",
  ],
  media: {
    images: [
      "https://example.com/images/logo.png",
      "https://example.com/images/banner.jpg",
    ],
    videos: [
      "https://example.com/videos/intro.mp4",
      "https://example.com/videos/demo.webm",
    ],
    documents: [
      "https://example.com/docs/whitepaper.pdf",
      "https://example.com/docs/manual.docx",
    ],
  },
};
```

## Fields

| Field                                                                                                        | Type                                                                                                         | Required                                                                                                     | Description                                                                                                  | Example                                                                                                      |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `internal`                                                                                                   | *string*[]                                                                                                   | :heavy_minus_sign:                                                                                           | Array of internal links from the same domain                                                                 | [<br/>"https://example.com/about",<br/>"https://example.com/contact",<br/>"https://example.com/services"<br/>] |
| `external`                                                                                                   | *string*[]                                                                                                   | :heavy_minus_sign:                                                                                           | Array of external links from other domains                                                                   | [<br/>"https://github.com/example/repo",<br/>"https://twitter.com/example",<br/>"https://linkedin.com/company/example"<br/>] |
| `media`                                                                                                      | [models.ExtractedLinksMedia](../models/extractedlinksmedia.md)                                               | :heavy_minus_sign:                                                                                           | Media files categorized by type                                                                              |                                                                                                              |