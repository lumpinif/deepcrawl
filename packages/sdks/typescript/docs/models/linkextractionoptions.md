# LinkExtractionOptions

## Example Usage

```typescript
import { LinkExtractionOptions } from "@deepcrawl-sdk/ts";

let value: LinkExtractionOptions = {
  includeExternal: false,
  includeMedia: true,
  excludePatterns: [
    "^/admin/",
    "\.pdf$",
    "/private/",
  ],
  removeQueryParams: true,
};
```

## Fields

| Field                                                 | Type                                                  | Required                                              | Description                                           | Example                                               |
| ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| `includeExternal`                                     | *boolean*                                             | :heavy_minus_sign:                                    | Whether to include links from other domains           | false                                                 |
| `includeMedia`                                        | *boolean*                                             | :heavy_minus_sign:                                    | Whether to include media files (images, videos, docs) | true                                                  |
| `excludePatterns`                                     | *string*[]                                            | :heavy_minus_sign:                                    | Array of regex patterns to exclude URLs               | [<br/>"^/admin/",<br/>"\\.pdf$",<br/>"/private/"<br/>] |
| `removeQueryParams`                                   | *boolean*                                             | :heavy_minus_sign:                                    | Whether to remove query parameters from URLs          | true                                                  |