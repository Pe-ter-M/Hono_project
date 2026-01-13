// src/lib/logger/index.ts
import { createConsola,type ConsolaInstance, type ConsolaOptions } from 'consola';
import { getLoggerConfig, type LoggerConfig } from '../../config/logger.config.js';
import { FileTransport } from './file-transport.js';

export class LoggerService {
  private consola!: ConsolaInstance;
  private fileTransport: FileTransport | null = null;
  private config: LoggerConfig;
  
  // Request context storage (for correlation IDs, user info, etc.)
  private context: Record<string, any> = {};

  constructor() {
    this.config = getLoggerConfig();
    this.initializeLogger();
  }

  private initializeLogger(): void {
    const consolaOptions: Partial<ConsolaOptions> = {
      level: this.mapLevelToConsola(this.config.level),
      defaults: {
        tag: 'API',
        additional: 'gray',
      },
    };

    // Console configuration
    if (this.config.console.enabled) {
      consolaOptions.stdout = process.stdout;
      consolaOptions.stderr = process.stderr;
      consolaOptions.formatOptions = {
        colors: this.config.console.colors,
        date: this.config.console.fancy,
        compact: !this.config.console.fancy,
      };
    } else {
      // Disable console output
      consolaOptions.stdout = { write: () => {} } as any;
      consolaOptions.stderr = { write: () => {} } as any;
    }

    this.consola = createConsola(consolaOptions);

    // File transport
    if (this.config.file.enabled) {
      this.fileTransport = new FileTransport(this.config.file);
      this.setupFileLogging();
    }
  }

  private mapLevelToConsola(level: LoggerConfig['level']): number {
    const levels = {
      fatal: 0,
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
      silent: 5,
    };
    return levels[level] || 2;
  }

  private setupFileLogging(): void {
    if (!this.fileTransport) return;

    // Override consola's log method to also write to file
    const originalLog = this.consola.log;
    
    this.consola.log = (...args: any[]) => {
      // Call original consola log
      originalLog.apply(this.consola, args);
      
      // Write to file in JSON format for production, plain text for dev
      const logEntry = this.config.file.jsonFormat 
        ? this.createJsonLog(args)
        : this.createTextLog(args);
      
      this.fileTransport!.write(logEntry);
    };
  }

  private createJsonLog(args: any[]): string {
    const [message, ...rest] = args;
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: this.getLogLevelFromArgs(args),
      message: typeof message === 'string' ? message : JSON.stringify(message),
      context: { ...this.context },
      data: rest.length > 0 ? rest : undefined,
      pid: process.pid,
      memory: this.config.features.memoryUsage 
        ? { 
            rss: process.memoryUsage().rss,
            heapUsed: process.memoryUsage().heapUsed,
            heapTotal: process.memoryUsage().heapTotal,
          }
        : undefined,
    };
    
    return JSON.stringify(logEntry);
  }

  private createTextLog(args: any[]): string {
    const timestamp = new Date().toLocaleString();
    const contextStr = Object.keys(this.context).length 
      ? ` [${Object.entries(this.context).map(([k, v]) => `${k}=${v}`).join(', ')}]`
      : '';
    
    return `[${timestamp}]${contextStr} ${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ')}`;
  }

  private getLogLevelFromArgs(args: any[]): string {
    // Consola adds level info to args
    if (args[0]?.level) return args[0].level;
    if (args[0]?.type) return args[0].type;
    return 'info';
  }

  // Public API

  setContext(context: Record<string, any>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  clearContext(): this {
    this.context = {};
    return this;
  }

  // Core logging methods
  fatal(message: string, data?: any): void {
    this.consola.fatal(message, data);
  }

  error(message: string, error?: Error, data?: any): void {
    const errorData = error 
      ? { 
          error: error.message,
          stack: this.config.features.errorStackTraces ? error.stack : undefined,
          ...data,
        }
      : data;
    
    this.consola.error(message, errorData);
  }

  warn(message: string, data?: any): void {
    this.consola.warn(message, data);
  }

  info(message: string, data?: any): void {
    this.consola.info(message, data);
  }

  debug(message: string, data?: any): void {
    this.consola.debug(message, data);
  }

  trace(message: string, data?: any): void {
    this.consola.trace(message, data);
  }

  // Specialized logging methods
  http(request: {
    method: string;
    url: string;
    status: number;
    duration: number;
    userAgent?: string;
    ip?: string;
  }): void {
    if (!this.config.features.requestLogging) return;

    const { method, url, status, duration, userAgent, ip } = request;
    
    this.consola.log({
      type: 'http',
      message: `${method} ${url} - ${status} (${duration}ms)`,
      method,
      url,
      status,
      duration,
      userAgent,
      ip,
      ...this.context,
    });
  }

  database(query: string, duration: number, success: boolean = true): void {
    this.consola.log({
      type: 'database',
      message: `DB ${success ? '✓' : '✗'} ${duration}ms`,
      query: this.config.environment === 'production' ? undefined : query,
      duration,
      success,
      ...this.context,
    });
  }

  performance(operation: string, duration: number, threshold: number = 100): void {
    if (!this.config.features.performanceMetrics) return;

    const level = duration > threshold ? 'warn' : 'debug';
    this.consola[level]({
      type: 'performance',
      message: `${operation} took ${duration}ms`,
      operation,
      duration,
      threshold,
      ...this.context,
    });
  }

  // Lifecycle methods
  startup(message: string): void {
    this.consola.start(message);
  }

  ready(message: string): void {
    this.consola.ready(message);
  }

  shutdown(message: string): void {
    this.consola.info(`🛑 ${message}`);
    if (this.fileTransport) {
      this.fileTransport.close();
    }
  }

  // Child logger with context
  child(context: Record<string, any>): LoggerService {
    const childLogger = new LoggerService();
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
}

// Global logger instance (singleton pattern)
let globalLogger: LoggerService | null = null;

export const getLogger = (): LoggerService => {
  if (!globalLogger) {
    globalLogger = new LoggerService();
  }
  return globalLogger;
};

// Convenience exports
export const logger = getLogger();