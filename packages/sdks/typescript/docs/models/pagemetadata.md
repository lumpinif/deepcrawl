# PageMetadata

## Example Usage

```typescript
import { PageMetadata } from "@deepcrawl-sdk/ts";

let value: PageMetadata = {
  title: "Example Website - Home Page",
  description: "This is an example website demonstrating metadata extraction.",
  language: "en",
  canonical: "https://example.com/",
  robots: "index, follow",
  author: "John Doe",
  keywords: [
    "example",
    "metadata",
    "extraction",
  ],
  lastModified: "2023-04-15T14:32:21Z",
  favicon: "https://example.com/favicon.ico",
  ogTitle: "Example Website",
  ogDescription: "Learn about our services",
  ogImage: "https://example.com/images/og-image.jpg",
  ogUrl: "https://example.com/",
  ogType: "website",
  ogSiteName: "Example Website",
  twitterCard: "summary_large_image",
  twitterSite: "@examplesite",
  twitterCreator: "@johndoe",
  twitterTitle: "Example Website - Official Site",
  twitterDescription: "The best example website on the internet",
  twitterImage: "https://example.com/images/twitter-card.jpg",
  isIframeAllowed: true,
};
```

## Fields

| Field                                                         | Type                                                          | Required                                                      | Description                                                   | Example                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| `title`                                                       | *string*                                                      | :heavy_minus_sign:                                            | Page title from title tag or meta title                       | Example Website - Home Page                                   |
| `description`                                                 | *string*                                                      | :heavy_minus_sign:                                            | Page description from meta description                        | This is an example website demonstrating metadata extraction. |
| `language`                                                    | *string*                                                      | :heavy_minus_sign:                                            | Page language from html lang attribute                        | en                                                            |
| `canonical`                                                   | *string*                                                      | :heavy_minus_sign:                                            | Canonical URL from link rel="canonical"                       | https://example.com/                                          |
| `robots`                                                      | *string*                                                      | :heavy_minus_sign:                                            | Robots directives from meta robots                            | index, follow                                                 |
| `author`                                                      | *string*                                                      | :heavy_minus_sign:                                            | Author information from meta author                           | John Doe                                                      |
| `keywords`                                                    | *string*[]                                                    | :heavy_minus_sign:                                            | Keywords array from meta keywords                             | [<br/>"example",<br/>"metadata",<br/>"extraction"<br/>]       |
| `lastModified`                                                | *string*                                                      | :heavy_minus_sign:                                            | Last modified date from HTTP headers                          | 2023-04-15T14:32:21Z                                          |
| `favicon`                                                     | *string*                                                      | :heavy_minus_sign:                                            | Favicon URL from link rel="icon" or similar                   | https://example.com/favicon.ico                               |
| `ogTitle`                                                     | *string*                                                      | :heavy_minus_sign:                                            | OpenGraph title from meta property="og:title"                 | Example Website                                               |
| `ogDescription`                                               | *string*                                                      | :heavy_minus_sign:                                            | OpenGraph description from meta property="og:description"     | Learn about our services                                      |
| `ogImage`                                                     | *string*                                                      | :heavy_minus_sign:                                            | OpenGraph image URL from meta property="og:image"             | https://example.com/images/og-image.jpg                       |
| `ogUrl`                                                       | *string*                                                      | :heavy_minus_sign:                                            | OpenGraph URL from meta property="og:url"                     | https://example.com/                                          |
| `ogType`                                                      | *string*                                                      | :heavy_minus_sign:                                            | OpenGraph type from meta property="og:type"                   | website                                                       |
| `ogSiteName`                                                  | *string*                                                      | :heavy_minus_sign:                                            | OpenGraph site name from meta property="og:site_name"         | Example Website                                               |
| `twitterCard`                                                 | *string*                                                      | :heavy_minus_sign:                                            | Twitter card type from meta name="twitter:card"               | summary_large_image                                           |
| `twitterSite`                                                 | *string*                                                      | :heavy_minus_sign:                                            | Twitter site username from meta name="twitter:site"           | @examplesite                                                  |
| `twitterCreator`                                              | *string*                                                      | :heavy_minus_sign:                                            | Twitter creator username from meta name="twitter:creator"     | @johndoe                                                      |
| `twitterTitle`                                                | *string*                                                      | :heavy_minus_sign:                                            | Twitter title from meta name="twitter:title"                  | Example Website - Official Site                               |
| `twitterDescription`                                          | *string*                                                      | :heavy_minus_sign:                                            | Twitter description from meta name="twitter:description"      | The best example website on the internet                      |
| `twitterImage`                                                | *string*                                                      | :heavy_minus_sign:                                            | Twitter image URL from meta name="twitter:image"              | https://example.com/images/twitter-card.jpg                   |
| `isIframeAllowed`                                             | *boolean*                                                     | :heavy_minus_sign:                                            | Whether iframe embedding is allowed                           | true                                                          |