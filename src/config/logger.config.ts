// src/config/logger.config.ts
export interface LoggerConfig {
  // Core settings
  level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  environment: 'development' | 'staging' | 'production';
  
  // Console logging
  console: {
    enabled: boolean;
    fancy: boolean;
    colors: boolean;
    dateFormat: string;
  };
  
  // File logging
  file: {
    enabled: boolean;
    directory: string;
    maxSize: string; // e.g., '10m', '100m', '1g'
    maxFiles: number;
    compress: boolean;
    jsonFormat: boolean; // JSON format for files (better for log aggregators)
  };
  
  // Features
  features: {
    requestLogging: boolean;
    errorStackTraces: boolean;
    performanceMetrics: boolean;
    memoryUsage: boolean;
  };
}

// Default configuration
export const defaultLoggerConfig: LoggerConfig = {
  level: process.env.LOG_LEVEL as any || 'info',
  environment: (process.env.NODE_ENV as any) || 'development',
  
  console: {
    enabled: true,
    fancy: process.env.NODE_ENV !== 'production',
    colors: process.env.NODE_ENV !== 'production',
    dateFormat: 'HH:mm:ss',
  },
  
  file: {
    enabled: process.env.LOG_TO_FILE === 'true',
    directory: process.env.LOG_DIR || 'logs',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '30'),
    compress: process.env.LOG_COMPRESS === 'true',
    jsonFormat: process.env.NODE_ENV === 'production',
  },
  
  features: {
    requestLogging: true,
    errorStackTraces: true,
    performanceMetrics: process.env.NODE_ENV === 'development',
    memoryUsage: process.env.NODE_ENV === 'development',
  },
};

// Environment-specific overrides
export const getLoggerConfig = (): LoggerConfig => {
  const config = { ...defaultLoggerConfig };
  
  // Production overrides
  if (config.environment === 'production') {
    config.console.fancy = false;
    config.file.enabled = true;
    config.file.jsonFormat = true;
    config.features.performanceMetrics = false;
  }
  
  // Development overrides
  if (config.environment === 'development') {
    config.level = 'debug';
    config.features.performanceMetrics = true;
  }
  
  return config;
};