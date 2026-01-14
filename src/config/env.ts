export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_ENABLED: process.env.LOG_ENABLED === 'true',
    LOG_TO_FILE: process.env.LOG_TO_FILE === 'true',
    LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_TIMESTAMP: process.env.LOG_TIMESTAMP !== 'false',
    LOG_COLORS: process.env.LOG_COLORS !== 'false',
} as const;

export type Env = typeof env;