import { logger } from '../lib/logger/index.js';

export const initializeLogger = async (): Promise<void> => {
    await logger.initialize();
};

export const shutdownLogger = async (): Promise<void> => {
    await logger.close();
};