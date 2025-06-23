# MetadataOptions

Options for metadata extraction.

## Example Usage

```typescript
import { MetadataOptions } from "@deepcrawl-sdk/ts";

let value: MetadataOptions = {
  robots: false,
  twitter: false,
};
```

## Fields

| Field                                                | Type                                                 | Required                                             | Description                                          | Example                                              |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `title`                                              | *boolean*                                            | :heavy_minus_sign:                                   | Extract page title from title tag or meta title      | true                                                 |
| `description`                                        | *boolean*                                            | :heavy_minus_sign:                                   | Extract meta description content                     | true                                                 |
| `language`                                           | *boolean*                                            | :heavy_minus_sign:                                   | Extract page language from html lang attribute       | true                                                 |
| `canonical`                                          | *boolean*                                            | :heavy_minus_sign:                                   | Extract canonical URL from link rel="canonical"      | true                                                 |
| `robots`                                             | *boolean*                                            | :heavy_minus_sign:                                   | Extract robots directives from meta robots           | false                                                |
| `author`                                             | *boolean*                                            | :heavy_minus_sign:                                   | Extract author information from meta author          | true                                                 |
| `keywords`                                           | *boolean*                                            | :heavy_minus_sign:                                   | Extract meta keywords and convert to array           | true                                                 |
| `favicon`                                            | *boolean*                                            | :heavy_minus_sign:                                   | Extract favicon URL from link rel="icon" or similar  | true                                                 |
| `openGraph`                                          | *boolean*                                            | :heavy_minus_sign:                                   | Extract Open Graph metadata (og:* properties)        | true                                                 |
| `twitter`                                            | *boolean*                                            | :heavy_minus_sign:                                   | Extract Twitter Card metadata (twitter:* properties) | false                                                |
| `isIframeAllowed`                                    | *boolean*                                            | :heavy_minus_sign:                                   | Check if iframe embedding is allowed                 | true                                                 |