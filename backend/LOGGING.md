# Backend logging

Every HTTP request is logged by `pino-http` when its response finishes. Logs
include a request ID, method, sanitized URL, status, response time, remote
address, and the authenticated user ID when available.

Valid incoming `X-Request-Id` values are preserved. Otherwise the backend
generates a UUID. The selected request ID is always returned in the response's
`X-Request-Id` header so clients can correlate failures with server logs.

Authorization headers, cookies, auth tokens, passwords, and sensitive URL query
parameters are redacted. Development logs are pretty-printed, while production
logs are newline-delimited JSON.

## Configuration

- `LOG_LEVEL`: Pino level such as `debug`, `info`, `warn`, or `error`. Defaults
  to `debug` in development and `info` otherwise.
- `LOG_PRETTY`: explicitly enable or disable pretty output with `true` or
  `false`.
- `SERVICE_NAME`: service field included in every log. Defaults to
  `p2m-backend`.

For request-scoped application logs, use `req.log`. It automatically includes
the request ID and, after authentication, the user ID:

```ts
req.log.info({ presentationId }, "Presentation updated");
```

For startup and background logs, import the base logger:

```ts
import { logger } from "./config/logger.js";

logger.info({ job: "cleanup" }, "Background job completed");
```
