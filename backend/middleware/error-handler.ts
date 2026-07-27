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
  if (error instanceof HttpError) {
    return error.status;
  }

  const candidate =
    typeof (error as { status?: unknown })?.status === "number"
      ? (error as { status: number }).status
      : (error as { statusCode?: unknown })?.statusCode;

  return typeof candidate === "number" &&
    Number.isInteger(candidate) &&
    candidate >= 400 &&
    candidate <= 599
    ? candidate
    : 500;
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
      : status === 400
        ? "BAD_REQUEST"
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
