// src/lib/logger/file-transport.ts
import fs from 'fs/promises';
import { createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import path from 'path';
import { type LoggerConfig } from '../../config/logger.config.js';

export class FileTransport {
  private stream: ReturnType<typeof createWriteStream> | null = null;
  private currentFile: string = '';
  private currentSize: number = 0;
  private fileCount: number = 0;
  private readonly maxBytes: number;

  constructor(private config: LoggerConfig['file']) {
    this.maxBytes = this.parseSize(config.maxSize);
    this.ensureLogDirectory();
    this.rotateFile(); // Start with first file
  }

  private parseSize(size: string): number {
    const units: Record<string, number> = {
      b: 1,
      k: 1024,
      m: 1024 * 1024,
      g: 1024 * 1024 * 1024,
    };
    
    const match = size.match(/^(\d+)([bkmg])$/i);
    if (!match) return 10 * 1024 * 1024; // Default 10MB
    
    const [, num, unit] = match;
    return parseInt(num) * units[unit.toLowerCase()];
  }

  private ensureLogDirectory(): void {
    if (!existsSync(this.config.directory)) {
      mkdirSync(this.config.directory, { recursive: true });
    }
  }

  private getLogFiles(): string[] {
    try {
      return readdirSync(this.config.directory)
        .filter(file => file.endsWith('.log'))
        .sort();
    } catch {
      return [];
    }
  }

  private rotateFile(): void {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
      
      // Compress old file if enabled
      if (this.config.compress && this.currentFile) {
        this.compressFile(this.currentFile);
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.fileCount++;
    this.currentFile = path.join(this.config.directory, `app-${timestamp}.log`);
    this.currentSize = 0;

    // Clean up old files
    this.cleanupOldFiles();

    // Create new stream
    this.stream = createWriteStream(this.currentFile, { flags: 'a' });
  }

  private async compressFile(filename: string): Promise<void> {
    // In a real implementation, you'd use zlib or a compression library
    // This is a placeholder for the compression logic
    const compressedName = filename + '.gz';
    // Actual compression would go here
    console.log(`Would compress ${filename} to ${compressedName}`);
  }

  private cleanupOldFiles(): void {
    const files = this.getLogFiles();
    if (files.length > this.config.maxFiles) {
      const filesToDelete = files.slice(0, files.length - this.config.maxFiles);
      filesToDelete.forEach(file => {
        try {
          unlinkSync(path.join(this.config.directory, file));
        } catch (error) {
          console.error('Failed to delete old log file:', error);
        }
      });
    }
  }

  write(message: string): void {
    if (!this.stream || this.currentSize >= this.maxBytes) {
      this.rotateFile();
    }

    if (this.stream) {
      this.stream.write(message + '\n');
      this.currentSize += Buffer.byteLength(message);
    }
  }

  close(): void {
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
  }
}