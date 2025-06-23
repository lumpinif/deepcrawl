# ExtractedLinksMedia

Media files categorized by type

## Example Usage

```typescript
import { ExtractedLinksMedia } from "@deepcrawl-sdk/ts";

let value: ExtractedLinksMedia = {
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
};
```

## Fields

| Field                                                                                 | Type                                                                                  | Required                                                                              | Description                                                                           | Example                                                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `images`                                                                              | *string*[]                                                                            | :heavy_minus_sign:                                                                    | Array of image file URLs                                                              | [<br/>"https://example.com/images/logo.png",<br/>"https://example.com/images/banner.jpg"<br/>] |
| `videos`                                                                              | *string*[]                                                                            | :heavy_minus_sign:                                                                    | Array of video file URLs                                                              | [<br/>"https://example.com/videos/intro.mp4",<br/>"https://example.com/videos/demo.webm"<br/>] |
| `documents`                                                                           | *string*[]                                                                            | :heavy_minus_sign:                                                                    | Array of document file URLs                                                           | [<br/>"https://example.com/docs/whitepaper.pdf",<br/>"https://example.com/docs/manual.docx"<br/>] |