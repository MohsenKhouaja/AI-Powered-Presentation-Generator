import type { Server } from "node:http";
import process from "node:process";
import { closeLogger, flushLoggerSync, logger } from "./config/logger.js";
import { db } from "./database/index.js";

type ShutdownSignal = "SIGINT" | "SIGTERM";

const DEFAULT_SHUTDOWN_TIMEOUT_MS = 30_000;

let shutdownPromise: Promise<void> | undefined;

function getShutdownTimeoutMs(): number {
  const configuredTimeout = Number(process.env.SHUTDOWN_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_SHUTDOWN_TIMEOUT_MS;
}

function closeHttpServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (
        error &&
        (error as NodeJS.ErrnoException).code !== "ERR_SERVER_NOT_RUNNING"
      ) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function closeDatabases(): Promise<void> {
  await db.$client.end();
}

async function runShutdown(
  server: Server,
  signal: ShutdownSignal,
): Promise<void> {
  const startedAt = Date.now();
  const timeoutMs = getShutdownTimeoutMs();

  logger.info({ signal, timeoutMs }, "Graceful shutdown started");

  const deadline = setTimeout(() => {
    logger.fatal(
      { signal, timeoutMs },
      "Graceful shutdown deadline exceeded; forcing exit",
    );
    server.closeAllConnections();
    flushLoggerSync();
    process.exit(1);
  }, timeoutMs);

  try {
    await closeHttpServer(server);
    logger.info({ signal }, "HTTP server drained");

    await closeDatabases();
    logger.info({ signal }, "Database clients closed");

    logger.info(
      { signal, durationMs: Date.now() - startedAt },
      "Graceful shutdown completed",
    );
  } catch (error) {
    process.exitCode = 1;
    logger.error(
      { err: error, signal, durationMs: Date.now() - startedAt },
      "Graceful shutdown failed",
    );
  } finally {
    clearTimeout(deadline);
    try {
      await closeLogger();
    } catch (error) {
      process.exitCode = 1;
      // The logger is no longer reliable here, so use the synchronous fallback.
      console.error("Failed to close logging destinations", error);
    }
  }
}

export function shutdown(
  server: Server,
  signal: ShutdownSignal,
): Promise<void> {
  shutdownPromise ??= runShutdown(server, signal);
  return shutdownPromise;
}

export function registerGracefulShutdown(server: Server): void {
  const handleSignal = (signal: ShutdownSignal) => {
    void shutdown(server, signal);
  };
  process.once("SIGINT", handleSignal);
  process.once("SIGTERM", handleSignal);
}
