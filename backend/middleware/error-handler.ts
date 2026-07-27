import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import multer from "multer";
import {
  badRequest,
  HttpError,
  notFound,
  payloadTooLarge,
} from "../errors/http-error.js";

const normalizeError = (error: unknown): unknown => {
  if (error instanceof multer.MulterError) {
    return error.code === "LIMIT_FILE_SIZE"
      ? payloadTooLarge(
          "Uploaded content is too large",
          "UPLOAD_TOO_LARGE",
        )
      : badRequest("Upload is invalid", "INVALID_UPLOAD");
  }
  if (
    error instanceof SyntaxError &&
    (error as { type?: unknown }).type === "entity.parse.failed"
  ) {
    return badRequest(
      "Request body contains invalid JSON",
      "INVALID_JSON",
    );
  }
  return error;
};

const getStatus = (error: unknown): number => {
  return error instanceof HttpError ? error.status : 500;
};

const getMessage = (error: unknown): string =>
  error instanceof Error && error.message ? error.message : "Request failed";

export const routeNotFound: RequestHandler = (_req, _res, next) => {
  next(notFound("Route not found", "ROUTE_NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const normalizedError = normalizeError(error);
  const status = getStatus(normalizedError);
  const message = getMessage(normalizedError);
  const code =
    normalizedError instanceof HttpError
      ? normalizedError.code
      : "INTERNAL_ERROR";

  res.err = error instanceof Error ? error : new Error(message);
  res.status(status).json({
    error:
      status >= 500
        ? "Internal server error"
        : normalizedError instanceof HttpError
          ? message
          : "Request failed",
    code,
  });
};
