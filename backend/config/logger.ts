import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
import path from "node:path";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import pino from "pino";
import { pinoHttp } from "pino-http";
import type { LokiOptions } from "pino-loki";

dotenv.config({ quiet: true });

const environment = process.env.NODE_ENV ?? "development";
const serviceName = process.env.SERVICE_NAME ?? "p2m-backend";
const prettyLogs =
  process.env.LOG_PRETTY === undefined
    ? environment === "development"
    : process.env.LOG_PRETTY === "true";

const REDACTED = "[Redacted]";
const sensitiveQueryParameter =
  /^(?:access_?token|api_?key|authorization|code|password|pwd|refresh_?token|secret|token)$/i;

const consoleStream = prettyLogs
  ? pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: true,
        translateTime: "SYS:standard",
      },
    })
  : pino.destination(1);

const errorStream = pino.destination({
  dest: path.resolve(process.cwd(), "error.log"),
  mkdir: true,
});

const lokiStream = process.env.LOKI_URL
  ? pino.transport<LokiOptions>({
      target: "pino-loki",
      options: {
        host: process.env.LOKI_URL,
        labels: {
          service: serviceName,
          environment,
        },
        batching: {
          interval: 5,
          maxBufferSize: 10_000,
        },
      },
    })
  : undefined;

const logStreams = pino.multistream([
  { level: "trace", stream: consoleStream },
  { level: "error", stream: errorStream },
  ...(lokiStream ? [{ level: "trace" as const, stream: lokiStream }] : []),
]);

export const logger = pino(
  {
    level:
      process.env.LOG_LEVEL ??
      (environment === "development" ? "debug" : "info"),
    base: {
      pid: process.pid,
      hostname: hostname(),
      service: serviceName,
      environment,
    },
    // pino-loki converts Pino's numeric epoch milliseconds to Loki nanoseconds.
    timestamp: pino.stdTimeFunctions.epochTime,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        'res.headers["set-cookie"]',
        "body.password",
        "body.token",
        "body.accessToken",
        "body.refreshToken",
        "password",
        "token",
        "accessToken",
        "refreshToken",
        "*.password",
        "*.token",
        "*.accessToken",
        "*.refreshToken",
      ],
      censor: REDACTED,
    },
  },
  logStreams,
);

function sanitizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl, "http://localhost");
    for (const name of url.searchParams.keys()) {
      if (sensitiveQueryParameter.test(name)) {
        url.searchParams.set(name, REDACTED);
      }
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return rawUrl.split("?", 1)[0] ?? rawUrl;
  }
}

function getRequestId(req: Request, res: Response): string {
  const requestIdHeader = req.headers["x-request-id"];
  const incomingRequestId = Array.isArray(requestIdHeader)
    ? requestIdHeader[0]
    : requestIdHeader;
  const requestId =
    incomingRequestId && /^[A-Za-z0-9._:-]{1,128}$/.test(incomingRequestId)
      ? incomingRequestId
      : randomUUID();

  res.setHeader("X-Request-Id", requestId);
  return requestId;
}

export const httpLogger = pinoHttp<Request, Response>({
  logger,
  genReqId: getRequestId,
  quietReqLogger: true,
  wrapSerializers: false,
  serializers: {
    req(req: Request) {
      return {
        id: req.id,
        method: req.method,
        url: sanitizeUrl(req.originalUrl || req.url),
        headers: req.headers,
        remoteAddress: req.ip || req.socket.remoteAddress,
        remotePort: req.socket.remotePort,
      };
    },
    res(res: Response) {
      return {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
      };
    },
    err: pino.stdSerializers.err,
  },
  customProps(req) {
    return req.authenticatedUserId
      ? { userId: req.authenticatedUserId }
      : {};
  },
  customLogLevel(_req, res, error) {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.path} completed with ${res.statusCode}`;
  },
  customErrorMessage(req, res) {
    return `${req.method} ${req.path} failed with ${res.statusCode}`;
  },
});
