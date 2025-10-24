/**
 * Structured Logging Service
 * Provides consistent, organized logging with levels and timestamps
 *
 * Features:
 * - Multiple log levels: DEBUG, INFO, WARN, ERROR
 * - Structured data logging with context
 * - Automatic timestamps
 * - Environment-aware (more verbose in dev, minimal in prod)
 * - Easy integration with monitoring services
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  stack?: string;
}

interface LoggerConfig {
  minLevel?: LogLevel;
  includeTimestamp?: boolean;
  includeStack?: boolean;
  enableConsole?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  private config: Required<LoggerConfig>;
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Keep last 500 logs in memory

  constructor(config: LoggerConfig = {}) {
    this.config = {
      minLevel: config.minLevel || (__DEV__ ? 'DEBUG' : 'INFO'),
      includeTimestamp: config.includeTimestamp ?? true,
      includeStack: config.includeStack ?? __DEV__,
      enableConsole: config.enableConsole ?? true,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(entry: LogEntry): string {
    let message = '';

    if (this.config.includeTimestamp) {
      message += `[${entry.timestamp}] `;
    }

    message += `[${entry.level}] ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      message += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      message += ` Error: ${entry.error.message}`;
    }

    if (entry.stack && this.config.includeStack) {
      message += `\n${entry.stack}`;
    }

    return message;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      stack: error?.stack,
    };

    // Store in memory
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      const formatted = this.formatMessage(entry);
      switch (level) {
        case 'DEBUG':
          console.debug(formatted);
          break;
        case 'INFO':
          console.log(formatted);
          break;
        case 'WARN':
          console.warn(formatted);
          break;
        case 'ERROR':
          console.error(formatted);
          break;
      }
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('DEBUG', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('WARN', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('ERROR', message, context, error);
  }

  /**
   * Get all logged entries (for debugging)
   */
  getLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let entries = [...this.logs];

    if (level) {
      entries = entries.filter((e) => e.level === level);
    }

    return entries.slice(-limit);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as formatted string (for sending to server)
   */
  exportLogs(limit: number = 100): string {
    return this.getLogs(undefined, limit)
      .map((entry) => this.formatMessage(entry))
      .join('\n');
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    url: string,
    context?: Record<string, any>
  ) {
    this.info(`[API] ${method} ${url}`, context);
  }

  /**
   * Log API response
   */
  logResponse(
    method: string,
    url: string,
    status: number,
    duration: number
  ) {
    this.info(`[API] ${method} ${url} - ${status} (${duration}ms)`, {
      status,
      duration,
    });
  }

  /**
   * Log API error
   */
  logRequestError(
    method: string,
    url: string,
    error: Error,
    status?: number
  ) {
    this.error(`[API] ${method} ${url} failed`, error, {
      status,
    });
  }

  /**
   * Log screen navigation
   */
  logNavigation(screen: string, params?: Record<string, any>) {
    this.info(`[NAVIGATION] Navigating to ${screen}`, params);
  }

  /**
   * Log analytics event
   */
  logEvent(event: string, data?: Record<string, any>) {
    this.info(`[EVENT] ${event}`, data);
  }

  /**
   * Log performance metric
   */
  logPerformance(metric: string, duration: number, context?: Record<string, any>) {
    this.info(`[PERF] ${metric}: ${duration}ms`, context);
  }
}

// Create singleton instance
const logger = new Logger();

export { Logger };
export default logger;
