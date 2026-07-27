export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, code = "BAD_REQUEST") =>
  new HttpError(400, message, code);

export const unauthorized = (
  message = "Authentication required",
  code = "UNAUTHORIZED",
) => new HttpError(401, message, code);

export const forbidden = (
  message = "You are not allowed to perform this action",
  code = "FORBIDDEN",
) => new HttpError(403, message, code);

export const notFound = (
  message = "Presentation not found",
  code = "PRESENTATION_NOT_FOUND",
) => new HttpError(404, message, code);

export const conflict = (message: string, code = "CONFLICT") =>
  new HttpError(409, message, code);

export const payloadTooLarge = (
  message = "Uploaded content is too large",
  code = "PAYLOAD_TOO_LARGE",
) => new HttpError(413, message, code);

export const badGateway = (
  message = "Upstream service failed",
  code = "BAD_GATEWAY",
) => new HttpError(502, message, code);

export const serviceUnavailable = (
  message = "Service unavailable",
  code = "SERVICE_UNAVAILABLE",
) => new HttpError(503, message, code);
