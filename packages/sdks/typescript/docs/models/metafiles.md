# MetaFiles

## Example Usage

```typescript
import { MetaFiles } from "@deepcrawl-sdk/ts";

let value: MetaFiles = {
  robots: "User-agent: *\n"
    + "Allow: /",
  sitemapXML: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
    + "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">...</urlset>",
};
```

## Fields

| Field                                                                                                           | Type                                                                                                            | Required                                                                                                        | Description                                                                                                     | Example                                                                                                         |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `robots`                                                                                                        | *string*                                                                                                        | :heavy_minus_sign:                                                                                              | Content of the robots.txt file                                                                                  | User-agent: *<br/>Allow: /                                                                                      |
| `sitemapXML`                                                                                                    | *string*                                                                                                        | :heavy_minus_sign:                                                                                              | Content of the sitemap.xml file                                                                                 | <?xml version="1.0" encoding="UTF-8"?><br/><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">...</urlset> |