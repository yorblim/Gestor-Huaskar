type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

function formatTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, ...meta: unknown[]) {
  if (process.env.NODE_ENV === "test" && level !== "ERROR") {
    return;
  }

  const prefix = `[${formatTimestamp()}] [${level}]`;
  switch (level) {
    case "ERROR":
      console.error(prefix, message, ...meta);
      break;
    case "WARN":
      console.warn(prefix, message, ...meta);
      break;
    case "DEBUG":
      if (process.env.NODE_ENV === "development") {
        console.debug(prefix, message, ...meta);
      }
      break;
    default:
      console.log(prefix, message, ...meta);
      break;
  }
}

export const logger = {
  info: (message: string, ...meta: unknown[]) => log("INFO", message, ...meta),
  warn: (message: string, ...meta: unknown[]) => log("WARN", message, ...meta),
  error: (message: string, ...meta: unknown[]) => log("ERROR", message, ...meta),
  debug: (message: string, ...meta: unknown[]) => log("DEBUG", message, ...meta),
};
