import { createConsola, LogLevels, type ConsolaInstance, type LogLevel } from 'consola';
import { env } from '../../config/env.js';
import { FileTransport } from './file-transport.js';

export class LoggerService {
    private static instance: LoggerService;
    private consola: ConsolaInstance;
    private fileTransport: FileTransport;
    private isInitialized = false;

    private constructor() {
        // Initialize with minimal config, will be configured in initialize()
        this.consola = createConsola({
            level: LogLevels.info,
            defaults: {
                tag: 'app',
            },
        });

        this.fileTransport = FileTransport.getInstance();
    }

    static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        if (!env.LOG_ENABLED) {
            this.consola.level = LogLevels.silent;
            return;
        }

        // Configure Consola based on environment
        const level = this.mapLogLevel(env.LOG_LEVEL);

        this.consola = createConsola({
            level,
            fancy: env.LOG_COLORS,
            formatOptions: {
                colors: env.LOG_COLORS,
                date: env.LOG_TIMESTAMP,
                compact: env.NODE_ENV === 'production',
            },
            defaults: {
                tag: 'app',
            },
        });

        // Initialize file transport if enabled
        if (env.LOG_TO_FILE) {
            await this.fileTransport.initialize();

            // Override consola's reporters to add file logging
            this.overrideReporters();
        }

        this.isInitialized = true;

        this.info('Logger initialized', {
            level: env.LOG_LEVEL,
            toFile: env.LOG_TO_FILE,
            enabled: env.LOG_ENABLED
        });
    }

    private mapLogLevel(level: string): LogLevel {
        const levelMap: Record<string, LogLevel> = {
            'fatal': LogLevels.fatal,
            'error': LogLevels.error,
            'warn': LogLevels.warn,
            'info': LogLevels.info,
            'log': LogLevels.log,
            'debug': LogLevels.debug,
            'verbose': LogLevels.verbose,
            'silent': LogLevels.silent,
        };

        return levelMap[level.toLowerCase()] || LogLevels.info;
    }

    private overrideReporters(): void {
        this.consola.setReporters([
            {
                log: (logObj) => {
                    const levelName = Object.keys(LogLevels).find(key => LogLevels[key as keyof typeof LogLevels] === logObj.level)?.toLowerCase() || 'info';
                    this.fileTransport.log(levelName, logObj.args);
                }
            }
        ]);
    }

    // Public logging methods
    fatal(message: string, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.fatal(message, ...args);
    }

    error(message: string, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.error(message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.warn(message, ...args);
    }

    info(message: string, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.info(message, ...args);
    }

    log(message: string, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.log(message, ...args);
    }

    debug(message: string, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.debug(message, ...args);
    }

    verbose(message: string, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.verbose(message, ...args);
    }

    success(message: string, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.success(message, ...args);
    }

    // Specialized logging methods
    http(method: string, url: string, status: number, duration: number, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;

        const statusColor = status >= 500 ? 'red' :
            status >= 400 ? 'yellow' :
                status >= 300 ? 'cyan' : 'green';

        this.consola.info(`HTTP ${method} ${url}`, {
            status,
            duration: `${duration}ms`,
            ...args
        });
    }

    database(query: string, duration: number, ...args: any[]): void {
        if (!env.LOG_ENABLED) return;
        this.consola.debug(`DB Query: ${query}`, {
            duration: `${duration}ms`,
            ...args
        });
    }

    // Method to add context to logs
    withContext(context: Record<string, any>) {
        return {
            log: (message: string, ...args: any[]) => this.consola.log({ ...context, message }, ...args),
            info: (message: string, ...args: any[]) => this.consola.info({ ...context, message }, ...args),
            error: (message: string, ...args: any[]) => this.consola.error({ ...context, message }, ...args),
            warn: (message: string, ...args: any[]) => this.consola.warn({ ...context, message }, ...args),
            debug: (message: string, ...args: any[]) => this.consola.debug({ ...context, message }, ...args),
        };
    }

    // Method to create child logger with prefix
    createChild(prefix: string) {
        const childConsola = this.consola.withTag(prefix);

        return {
            fatal: (message: string, ...args: any[]) => childConsola.fatal(message, ...args),
            error: (message: string, ...args: any[]) => childConsola.error(message, ...args),
            warn: (message: string, ...args: any[]) => childConsola.warn(message, ...args),
            info: (message: string, ...args: any[]) => childConsola.info(message, ...args),
            log: (message: string, ...args: any[]) => childConsola.log(message, ...args),
            debug: (message: string, ...args: any[]) => childConsola.debug(message, ...args),
            verbose: (message: string, ...args: any[]) => childConsola.verbose(message, ...args),
            success: (message: string, ...args: any[]) => childConsola.success(message, ...args),
        };
    }

    async close(): Promise<void> {
        if (env.LOG_TO_FILE) {
            await this.fileTransport.close();
        }
    }
}

// Export singleton instance
export const logger = LoggerService.getInstance();