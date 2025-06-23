# Deepcrawl
(*deepcrawl*)

## Overview

### Available Operations

* [getApiInfo](#getapiinfo)
* [getMarkdown](#getmarkdown) - Directly return page markdown content from the request URL.
* [readUrl](#readurl) - Returning full result object from the request URL.
* [extractLinks](#extractlinks) - Returning extracted links sitemap results for the request URL.

## getApiInfo

### Example Usage

```typescript
import { DeepcrawlApp } from "@deepcrawl-sdk/ts";

const deepcrawlApp = new DeepcrawlApp();

async function run() {
  const result = await deepcrawlApp.deepcrawl.getApiInfo();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { DeepcrawlAppCore } from "@deepcrawl-sdk/ts/core.js";
import { deepcrawlGetApiInfo } from "@deepcrawl-sdk/ts/funcs/deepcrawlGetApiInfo.js";

// Use `DeepcrawlAppCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const deepcrawlApp = new DeepcrawlAppCore();

async function run() {
  const res = await deepcrawlGetApiInfo(deepcrawlApp);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("deepcrawlGetApiInfo failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.GetApiRootResponse](../../models/operations/getapirootresponse.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.BaseErrorResponse        | 500                             | application/json                |
| errors.DeepcrawlAppDefaultError | 4XX, 5XX                        | \*/\*                           |

## getMarkdown

Directly return page markdown content from the request URL.

### Example Usage

```typescript
import { DeepcrawlApp } from "@deepcrawl-sdk/ts";

const deepcrawlApp = new DeepcrawlApp({
  bearer: process.env["DEEPCRAWLAPP_BEARER"] ?? "",
});

async function run() {
  const result = await deepcrawlApp.deepcrawl.getMarkdown({
    url: "example.com",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { DeepcrawlAppCore } from "@deepcrawl-sdk/ts/core.js";
import { deepcrawlGetMarkdown } from "@deepcrawl-sdk/ts/funcs/deepcrawlGetMarkdown.js";

// Use `DeepcrawlAppCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const deepcrawlApp = new DeepcrawlAppCore({
  bearer: process.env["DEEPCRAWLAPP_BEARER"] ?? "",
});

async function run() {
  const res = await deepcrawlGetMarkdown(deepcrawlApp, {
    url: "example.com",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("deepcrawlGetMarkdown failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetMarkdownRequest](../../models/operations/getmarkdownrequest.md)                                                                                                 | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[string](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.BaseErrorResponse        | 500                             | application/json                |
| errors.DeepcrawlAppDefaultError | 4XX, 5XX                        | \*/\*                           |

## readUrl

Returning full result object from the request URL.

### Example Usage

```typescript
import { DeepcrawlApp } from "@deepcrawl-sdk/ts";

const deepcrawlApp = new DeepcrawlApp({
  bearer: process.env["DEEPCRAWLAPP_BEARER"] ?? "",
});

async function run() {
  const result = await deepcrawlApp.deepcrawl.readUrl({
    url: "https://example.com",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { DeepcrawlAppCore } from "@deepcrawl-sdk/ts/core.js";
import { deepcrawlReadUrl } from "@deepcrawl-sdk/ts/funcs/deepcrawlReadUrl.js";

// Use `DeepcrawlAppCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const deepcrawlApp = new DeepcrawlAppCore({
  bearer: process.env["DEEPCRAWLAPP_BEARER"] ?? "",
});

async function run() {
  const res = await deepcrawlReadUrl(deepcrawlApp, {
    url: "https://example.com",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("deepcrawlReadUrl failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ReadUrlRequest](../../models/operations/readurlrequest.md)                                                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.ReadSuccessResponse](../../models/readsuccessresponse.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.BaseErrorResponse        | 500                             | application/json                |
| errors.DeepcrawlAppDefaultError | 4XX, 5XX                        | \*/\*                           |

## extractLinks

Returning extracted links sitemap results for the request URL.

### Example Usage

```typescript
import { DeepcrawlApp } from "@deepcrawl-sdk/ts";

const deepcrawlApp = new DeepcrawlApp({
  bearer: process.env["DEEPCRAWLAPP_BEARER"] ?? "",
});

async function run() {
  const result = await deepcrawlApp.deepcrawl.extractLinks({
    url: "https://example.com",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { DeepcrawlAppCore } from "@deepcrawl-sdk/ts/core.js";
import { deepcrawlExtractLinks } from "@deepcrawl-sdk/ts/funcs/deepcrawlExtractLinks.js";

// Use `DeepcrawlAppCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const deepcrawlApp = new DeepcrawlAppCore({
  bearer: process.env["DEEPCRAWLAPP_BEARER"] ?? "",
});

async function run() {
  const res = await deepcrawlExtractLinks(deepcrawlApp, {
    url: "https://example.com",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("deepcrawlExtractLinks failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ExtractLinksPostRequest](../../models/operations/extractlinkspostrequest.md)                                                                                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.LinksPostSuccessResponse](../../models/linkspostsuccessresponse.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.LinksPostErrorResponse   | 500                             | application/json                |
| errors.DeepcrawlAppDefaultError | 4XX, 5XX                        | \*/\*                           |