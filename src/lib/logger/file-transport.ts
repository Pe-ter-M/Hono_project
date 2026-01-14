import fs from 'fs';
import path from 'path';

export class FileTransport {
    private static instance: FileTransport;
    private stream?: fs.WriteStream;
    private initialized = false;
    private filePath: string;

    private constructor() {
        this.filePath = path.join(process.cwd(), 'logs', 'app.log');
    }

    static getInstance(): FileTransport {
        if (!FileTransport.instance) {
            FileTransport.instance = new FileTransport();
        }
        return FileTransport.instance;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
        this.stream = fs.createWriteStream(this.filePath, { flags: 'a' });
        this.initialized = true;
    }

    log(level: string, args: any[]): void {
        if (!this.initialized || !this.stream) return;

        const timestamp = new Date().toISOString();
        const message = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
        const line = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
        this.stream.write(line);
    }

    async close(): Promise<void> {
        if (!this.stream) return;

        await new Promise<void>((resolve, reject) => {
            const s = this.stream!;
            s.end(() => resolve());
            s.on('error', (err) => reject(err));
        });

        this.stream = undefined;
        this.initialized = false;
    }
}