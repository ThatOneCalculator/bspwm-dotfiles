declare type LogLevel = 'INFO' | 'WARN' | 'ERROR';
export declare const logMessage: (message: string, logLevel: LogLevel) => void;
export declare const logInfo: (message: string) => void;
export declare const logWarning: (message: string) => void;
export declare const logError: (message: string, error?: string | Error | undefined) => void;
export {};
//# sourceMappingURL=logger.d.ts.map