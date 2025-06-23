# Metrics

Metrics for the read operation.

## Example Usage

```typescript
import { Metrics } from "@deepcrawl-sdk/ts";

let value: Metrics = {
  readableDuration: "1.2s",
  duration: 1200,
  startTime: 1704067800000,
  endTime: 1704067801200,
};
```

## Fields

| Field                                                   | Type                                                    | Required                                                | Description                                             | Example                                                 |
| ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `readableDuration`                                      | *string*                                                | :heavy_check_mark:                                      | Human-readable representation of the operation duration | 1.2s                                                    |
| `duration`                                              | *number*                                                | :heavy_check_mark:                                      | Duration of the operation in milliseconds               | 1200                                                    |
| `startTime`                                             | *number*                                                | :heavy_check_mark:                                      | Timestamp in milliseconds when the operation started    | 1704067800000                                           |
| `endTime`                                               | *number*                                                | :heavy_check_mark:                                      | Timestamp in milliseconds when the operation finished   | 1704067801200                                           |