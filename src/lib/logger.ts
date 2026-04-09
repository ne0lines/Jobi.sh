import * as Sentry from "@sentry/nextjs";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (process.env.NODE_ENV === "production") {
    // Structured JSON for log aggregators (Vercel logs, etc.)
    console[level === "debug" ? "log" : level](JSON.stringify(entry));
  } else {
    console[level === "debug" ? "log" : level](
      `[${level.toUpperCase()}] ${message}`,
      context ?? "",
    );
  }

  // Forward errors and warnings to Sentry as breadcrumbs so they appear
  // as context attached to the next captured error event (not separate events)
  if (level === "error" || level === "warn") {
    Sentry.addBreadcrumb({
      category: "server-log",
      message,
      level: level === "error" ? "error" : "warning",
      data: context,
    });
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    log("debug", message, context),
  info: (message: string, context?: LogContext) =>
    log("info", message, context),
  warn: (message: string, context?: LogContext) =>
    log("warn", message, context),
  error: (message: string, context?: LogContext) =>
    log("error", message, context),
};
