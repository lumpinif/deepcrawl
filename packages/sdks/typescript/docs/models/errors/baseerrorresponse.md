# BaseErrorResponse

## Example Usage

```typescript
import { BaseErrorResponse } from "@deepcrawl-sdk/ts/models/errors";

// No examples available for this model
```

## Fields

| Field                                                    | Type                                                     | Required                                                 | Description                                              | Example                                                  |
| -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `success`                                                | *boolean*                                                | :heavy_check_mark:                                       | N/A                                                      | false                                                    |
| `targetUrl`                                              | *string*                                                 | :heavy_check_mark:                                       | The URL that was being processed when the error occurred | https://example.com/article                              |
| `error`                                                  | *string*                                                 | :heavy_check_mark:                                       | Error message describing what went wrong                 | Failed to fetch: 404 Not Found                           |